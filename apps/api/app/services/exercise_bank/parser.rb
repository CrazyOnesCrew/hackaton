require "bigdecimal"
require "nokogiri"

module ExerciseBank
  class Parser
    SCHEMA_PATH = File.expand_path("schema.xsd", __dir__)
    CHOICE_ANSWER_TYPES = %w[single_choice multi_choice].freeze
    ALLOWED_FUNCTIONS = %w[sin cos tan log ln sqrt abs exp].freeze
    XML_PARSE_OPTIONS = Nokogiri::XML::ParseOptions::STRICT |
      Nokogiri::XML::ParseOptions::NONET |
      Nokogiri::XML::ParseOptions::NOBLANKS

    class InvalidDocumentError < StandardError
      attr_reader :errors

      def initialize(errors)
        @errors = errors.freeze
        super("XML document is invalid: #{errors.join("; ")}")
      end
    end

    class << self
      def validate_schema(xml_string)
        new.validate_schema(xml_string)
      end

      def parse(xml_string)
        new.parse(xml_string)
      end

      def parse_with_report(xml_string)
        new.parse_with_report(xml_string)
      end
    end

    attr_reader :errors

    def initialize(topic_scope: Topic.kept)
      @topic_scope = topic_scope
      @errors = []
    end

    def validate_schema(xml_string)
      document = secure_document(xml_string)
      schema_errors(document)
    rescue Nokogiri::XML::SyntaxError => error
      [format_xml_error(error)]
    rescue ArgumentError => error
      [error.message]
    end

    def parse(xml_string)
      parse_with_report(xml_string).fetch(:exercises)
    end

    def parse_with_report(xml_string)
      @errors = []
      document = validated_document(xml_string)
      parsed_exercises = []

      document.xpath("/exerciseBank/exercise").each_with_index do |exercise_node, offset|
        exercise, exercise_errors = parse_exercise(exercise_node)

        if exercise_errors.empty?
          parsed_exercises << exercise
        else
          @errors << {
            index: offset + 1,
            title: text_at(exercise_node, "./title"),
            errors: exercise_errors
          }
        end
      end

      { exercises: parsed_exercises, rejected: @errors.map(&:dup) }
    end

    private

    def validated_document(xml_string)
      document = secure_document(xml_string)
      errors = schema_errors(document)
      raise InvalidDocumentError, errors if errors.any?

      document
    rescue Nokogiri::XML::SyntaxError => error
      raise InvalidDocumentError, [format_xml_error(error)]
    rescue ArgumentError => error
      raise InvalidDocumentError, [error.message]
    end

    def secure_document(xml_string)
      raise ArgumentError, "XML input must be a string" unless xml_string.is_a?(String)
      raise ArgumentError, "XML input must not be blank" if xml_string.strip.empty?
      raise ArgumentError, "document type declarations are not allowed" if xml_string.match?(/<\s*!DOCTYPE/i)

      Nokogiri::XML::Document.parse(xml_string, nil, nil, XML_PARSE_OPTIONS)
    end

    def schema_errors(document)
      schema.validate(document).map { |error| format_xml_error(error) }
    end

    def schema
      @schema ||= Nokogiri::XML::Schema(File.read(SCHEMA_PATH))
    end

    def format_xml_error(error)
      message = error.message.to_s.strip.gsub(/\s+/, " ")
      error.line.to_i.positive? ? "line #{error.line}: #{message}" : message
    end

    def parse_exercise(node)
      errors = []
      topic = resolve_topic(node["topicSlug"], errors)
      title = text_at(node, "./title")
      statement = text_at(node, "./statement")
      errors << "title must not be blank" if title.empty?
      errors << "statement must not be blank" if statement.empty?

      variables, variable_errors = parse_variables(node)
      errors.concat(variable_errors)
      declared_variables = variables.map { |variable| variable.fetch("name") }

      steps = node.xpath("./steps/step").each_with_index.map do |step_node, offset|
        step, step_errors = parse_step(step_node, offset + 1, declared_variables)
        errors.concat(step_errors)
        step
      end

      exercise = {
        topic_id: topic&.id,
        title: title,
        statement: statement,
        difficulty: node["difficulty"],
        status: "draft",
        source: "xml_import",
        variables: variables,
        steps: steps
      }

      [exercise, errors]
    end

    def resolve_topic(slug, errors)
      topics = @topic_scope.where(slug: slug).order(:id).limit(2).to_a

      case topics.size
      when 0
        errors << "topic slug '#{slug}' does not exist"
        nil
      when 1
        topics.first
      else
        errors << "topic slug '#{slug}' is ambiguous"
        nil
      end
    end

    def parse_variables(exercise_node)
      errors = []
      seen_names = {}
      variables = exercise_node.xpath("./variables/variable").each_with_index.map do |node, offset|
        position = offset + 1
        name = node["name"].to_s.strip
        minimum = decimal_number(node["min"])
        maximum = decimal_number(node["max"])

        errors << "variable #{position} name must not be blank" if name.empty?
        errors << "variable '#{name}' is declared more than once" if seen_names[name]
        errors << "variable '#{name}' domain min must be less than max" unless minimum < maximum
        seen_names[name] = true

        { "name" => name, "domain" => { "min" => minimum, "max" => maximum } }
      end

      [variables, errors]
    end

    def parse_step(node, position, declared_variables)
      answer_type = node["answerType"]
      errors = []
      prompt = text_at(node, "./prompt")
      errors << "step #{position} prompt must not be blank" if prompt.empty?

      tolerance = BigDecimal(node["tolerance"] || "0.001")
      errors << "step #{position} tolerance must be nonnegative" if tolerance.negative?

      options, correct_option_ids, option_errors = parse_options(node, position)
      errors.concat(option_errors)
      correct_answer, answer_errors = parse_correct_answer(
        node,
        position,
        answer_type,
        options,
        correct_option_ids,
        declared_variables
      )
      errors.concat(answer_errors)

      hints, hint_errors = parse_hints(node, position)
      errors.concat(hint_errors)

      step = {
        phase: node["phase"],
        position: position,
        prompt: prompt,
        answer_type: answer_type,
        options: options,
        correct_answer: correct_answer,
        tolerance: tolerance,
        max_score: Integer(node["maxScore"] || "10"),
        hints: hints
      }

      [step, errors]
    end

    def parse_options(step_node, step_position)
      errors = []
      seen_ids = {}
      correct_ids = []
      options = step_node.xpath("./options/option").each_with_index.map do |node, offset|
        option_position = offset + 1
        id = node["id"].to_s.strip
        label = node.text.to_s.strip

        errors << "step #{step_position} option #{option_position} id must not be blank" if id.empty?
        errors << "step #{step_position} option id '#{id}' is duplicated" if seen_ids[id]
        errors << "step #{step_position} option '#{id}' label must not be blank" if label.empty?
        seen_ids[id] = true
        correct_ids << id if xml_boolean(node["correct"])

        { "id" => id, "label" => label }
      end

      [options, correct_ids, errors]
    end

    def parse_correct_answer(step_node, position, answer_type, options, correct_option_ids, declared_variables)
      correct_answer_node = step_node.at_xpath("./correctAnswer")

      if CHOICE_ANSWER_TYPES.include?(answer_type)
        errors = choice_errors(position, answer_type, options, correct_option_ids, correct_answer_node)
        return [correct_option_ids, errors]
      end

      errors = []
      errors << "step #{position} options are only allowed for choice answers" if options.any?

      case answer_type
      when "numeric"
        parse_numeric_answer(correct_answer_node, position, errors)
      when "expression"
        parse_expression_answer(correct_answer_node, position, declared_variables, errors)
      else
        [nil, errors]
      end
    end

    def choice_errors(position, answer_type, options, correct_option_ids, correct_answer_node)
      errors = []
      errors << "step #{position} choice answer requires at least one option" if options.empty?
      errors << "step #{position} choice answer requires at least one correct option" if correct_option_ids.empty?
      if answer_type == "single_choice" && correct_option_ids.size > 1
        errors << "step #{position} single_choice requires exactly one correct option"
      end
      errors << "step #{position} choice answer must not include correctAnswer" if correct_answer_node
      errors
    end

    def parse_numeric_answer(node, position, errors)
      unless exact_attributes?(node, %w[value])
        errors << "step #{position} numeric answer requires correctAnswer with only a value attribute"
        return [nil, errors]
      end

      [{ "value" => decimal_number(node["value"]) }, errors]
    end

    def parse_expression_answer(node, position, declared_variables, errors)
      unless exact_attributes?(node, %w[expression]) && node["expression"].to_s.strip.present?
        errors << "step #{position} expression answer requires correctAnswer with only a non-empty expression attribute"
        return [nil, errors]
      end

      expression = node["expression"].to_s.strip
      undeclared = expression_variables(expression) - declared_variables
      if undeclared.any?
        errors << "step #{position} expression uses undeclared variables: #{undeclared.sort.join(", ")}"
      end

      [{ "expression" => expression }, errors]
    end

    def exact_attributes?(node, expected_names)
      node && node.attribute_nodes.map(&:name).sort == expected_names.sort
    end

    def expression_variables(expression)
      without_numbers = expression.gsub(/\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/, " ")
      without_numbers.scan(/[A-Za-z_][A-Za-z0-9_]*/).uniq - ALLOWED_FUNCTIONS
    end

    def parse_hints(step_node, step_position)
      errors = []
      hints = step_node.xpath("./hints/hint").each_with_index.map do |node, offset|
        position = offset + 1
        content = node.text.to_s.strip
        errors << "step #{step_position} hint #{position} content must not be blank" if content.empty?

        {
          position: position,
          content: content,
          penalty: Integer(node["penalty"] || "2")
        }
      end

      [hints, errors]
    end

    def decimal_number(value)
      decimal = BigDecimal(value)
      decimal.frac.zero? ? decimal.to_i : decimal.to_f
    end

    def xml_boolean(value)
      %w[true 1].include?(value)
    end

    def text_at(node, xpath)
      node.at_xpath(xpath)&.text.to_s.strip
    end
  end
end
