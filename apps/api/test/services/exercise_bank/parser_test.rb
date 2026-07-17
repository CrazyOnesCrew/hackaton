require "test_helper"

module ExerciseBank
  class ParserTest < ActiveSupport::TestCase
    setup do
      @topic = create_topic(name: "Linear equations", slug: "linear-equations")
      @parser = Parser.new
    end

    test "validates a conforming document against the bundled schema" do
      assert_empty @parser.validate_schema(fixture_xml("exercise_bank_valid.xml"))
    end

    test "keeps the runtime schema structurally synchronized with the contract" do
      contract_path = Rails.root.join("../..", "specs/001-paag/contracts/exercise-bank.xsd")
      runtime_schema = Nokogiri::XML(File.read(Parser::SCHEMA_PATH)) { |config| config.strict.nonet }
      contract_schema = Nokogiri::XML(File.read(contract_path)) { |config| config.strict.nonet }

      assert_equal contract_schema.canonicalize, runtime_schema.canonicalize
    end

    test "returns deterministic readable schema errors" do
      xml = fixture_xml("exercise_bank_invalid_schema.xml")

      first_errors = @parser.validate_schema(xml)
      second_errors = @parser.validate_schema(xml)

      assert_equal first_errors, second_errors
      assert first_errors.all? { |error| error.match?(/\Aline \d+:/) }
      assert first_errors.any? { |error| error.include?("version") }
      assert first_errors.any? { |error| error.include?("difficulty") }
    end

    test "reports malformed XML and rejects it during parsing" do
      xml = "<exerciseBank version=\"1.0\"><exercise>"

      errors = @parser.validate_schema(xml)
      exception = assert_raises(Parser::InvalidDocumentError) { @parser.parse(xml) }

      assert_equal errors, exception.errors
      assert errors.first.start_with?("line 1:")
    end

    test "rejects document type declarations without resolving external entities" do
      xml = fixture_xml("exercise_bank_xxe.xml")

      errors = @parser.validate_schema(xml)
      exception = assert_raises(Parser::InvalidDocumentError) { @parser.parse(xml) }

      assert_equal [ "document type declarations are not allowed" ], errors
      assert_equal errors, exception.errors
      assert_not_includes exception.message, "root:"
    end

    test "maps a complete bank to persistence-ready nested attributes" do
      exercises = @parser.parse(fixture_xml("exercise_bank_valid.xml"))

      assert_equal 2, exercises.size
      first = exercises.first
      assert_equal(
        {
          topic_id: @topic.id,
          title: "Linear equation practice",
          statement: "Solve $2x + 1 = 5$ step by step.",
          difficulty: "medium",
          status: "draft",
          source: "xml_import",
          variables: [ { "name" => "x", "domain" => { "min" => -10, "max" => 10 } } ]
        },
        first.except(:steps)
      )

      assert_equal %w[identification planning tools procedure], first[:steps].pluck(:phase)
      assert_equal %w[single_choice multi_choice numeric expression], first[:steps].pluck(:answer_type)
      assert_equal [ "linear" ], first[:steps].first[:correct_answer]
      assert_equal %w[add multiply], first[:steps].second[:correct_answer]
      assert_equal({ "value" => 4 }, first[:steps].third[:correct_answer])
      assert_equal({ "expression" => "2*x+1" }, first[:steps].fourth[:correct_answer])
      assert_equal BigDecimal("0.01"), first[:steps].third[:tolerance]
      assert_equal(
        [ { position: 1, content: "Look at the largest exponent.", penalty: 1 } ],
        first[:steps].first[:hints]
      )

      assert_persistable(first)
    end

    test "keeps valid exercises and reports semantic failures by one-based index" do
      xml = fixture_xml("exercise_bank_invalid_semantics.xml")
      assert_empty @parser.validate_schema(xml)

      result = @parser.parse_with_report(xml)

      assert_equal [ "Valid exercise in a mixed bank" ], result[:exercises].pluck(:title)
      assert_equal [ 2, 3, 4 ], result[:rejected].pluck(:index)
      assert_equal result[:rejected], @parser.errors
      assert_includes result[:rejected][0][:errors], "topic slug 'missing-topic' does not exist"
      assert_includes result[:rejected][1][:errors],
        "step 1 choice answer requires at least one correct option"
      assert_includes result[:rejected][2][:errors],
        "step 1 numeric answer requires correctAnswer with only a value attribute"
      assert_includes result[:rejected][2][:errors],
        "step 2 expression uses undeclared variables: y"
    end

    test "reports ambiguous topic slugs instead of selecting one arbitrarily" do
      create_topic(subject: create_subject, name: "Other linear equations", slug: "linear-equations")

      result = @parser.parse_with_report(fixture_xml("exercise_bank_valid.xml"))

      assert_empty result[:exercises]
      assert_equal [ 1, 2 ], result[:rejected].pluck(:index)
      assert result[:rejected].all? { |item| item[:errors].include?("topic slug 'linear-equations' is ambiguous") }
    end

    private

    def fixture_xml(name)
      file_fixture(name).read
    end

    def assert_persistable(attributes)
      steps = attributes.fetch(:steps)
      exercise = Exercise.create!(attributes.except(:steps))

      steps.each do |step_attributes|
        hints = step_attributes.fetch(:hints)
        step = exercise.exercise_steps.create!(step_attributes.except(:hints))
        hints.each { |hint_attributes| step.hints.create!(hint_attributes) }
      end

      assert_equal 4, exercise.exercise_steps.count
      assert_equal 2, exercise.exercise_steps.sum { |step| step.hints.count }
    end
  end
end
