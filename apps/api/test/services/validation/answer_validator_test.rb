require "test_helper"

class Validation::AnswerValidatorTest < ActiveSupport::TestCase
  ExerciseDouble = Struct.new(:variables, keyword_init: true)
  StepDouble = Struct.new(
    :id,
    :answer_type,
    :correct_answer,
    :tolerance,
    :options,
    :exercise,
    keyword_init: true
  )

  DEFAULT_VARIABLES = [
    { "name" => "x", "domain" => { "min" => -1, "max" => 1 } },
    { "name" => "y", "domain" => { "min" => 0.5, "max" => 2 } }
  ].freeze
  POSITIVE_X = [
    { "name" => "x", "domain" => { "min" => 0.5, "max" => 3 } }
  ].freeze

  EXPRESSION_CASES = [
    [ "combines like terms", "x+x", "2*x", DEFAULT_VARIABLES ],
    [ "expands square of sum", "(x+1)^2", "x^2+2*x+1", DEFAULT_VARIABLES ],
    [ "expands difference of squares", "(x-1)*(x+1)", "x^2-1", DEFAULT_VARIABLES ],
    [ "combines equal halves", "x/2+x/2", "x", DEFAULT_VARIABLES ],
    [ "uses trigonometric identity", "sin(x)^2+cos(x)^2", "1", DEFAULT_VARIABLES ],
    [ "inverts natural log and exp", "ln(exp(x))", "x", DEFAULT_VARIABLES ],
    [ "treats log as natural log", "log(exp(x))", "x", DEFAULT_VARIABLES ],
    [ "matches sqrt square to absolute", "sqrt(x^2)", "abs(x)", DEFAULT_VARIABLES ],
    [ "handles absolute of negation", "abs(-x)", "abs(x)", DEFAULT_VARIABLES ],
    [ "cancels opposite exponents", "exp(x)*exp(-x)", "1", DEFAULT_VARIABLES ],
    [ "expands a cube", "(x+1)^3", "x^3+3*x^2+3*x+1", DEFAULT_VARIABLES ],
    [ "uses exponent addition", "2^(x+1)", "2*2^x", DEFAULT_VARIABLES ],
    [ "respects unary exponent precedence", "-(x^2)", "-x^2", DEFAULT_VARIABLES ],
    [ "squares a negation", "(-x)^2", "x^2", DEFAULT_VARIABLES ],
    [ "subtracts an expression from itself", "x-x", "0", DEFAULT_VARIABLES ],
    [ "preserves a rational expression", "x/y", "x/y", DEFAULT_VARIABLES ],
    [ "expands two variable square", "(x+y)^2", "x^2+2*x*y+y^2", DEFAULT_VARIABLES ],
    [ "distributes across two variables", "x*(y+1)", "x*y+x", DEFAULT_VARIABLES ],
    [ "uses odd sine identity", "sin(-x)", "-sin(x)", DEFAULT_VARIABLES ],
    [ "uses even cosine identity", "cos(-x)", "cos(x)", DEFAULT_VARIABLES ],
    [ "matches tangent quotient", "tan(x)", "sin(x)/cos(x)", DEFAULT_VARIABLES ],
    [ "multiplies positive roots", "sqrt(x)*sqrt(x)", "x", POSITIVE_X ],
    [ "rewrites logarithm of square", "ln(x^2)", "2*ln(abs(x))", POSITIVE_X ],
    [ "scales a rational denominator", "1/(x+2)", "2/(2*x+4)", DEFAULT_VARIABLES ],
    [ "matches decimal coefficient", ".5*x", "x/2", DEFAULT_VARIABLES ],
    [ "parses scientific notation", "1e2+x", "100+x", DEFAULT_VARIABLES ],
    [ "handles zero exponent", "x^0", "1", POSITIVE_X ],
    [ "handles multiplication by zero", "0*x", "0", DEFAULT_VARIABLES ],
    [ "cancels a nonzero quotient", "x/x", "1", POSITIVE_X ],
    [ "inverts exp and positive log", "exp(ln(x))", "x", POSITIVE_X ],
    [ "squares a square root", "(sqrt(x+1))^2", "x+1", POSITIVE_X ],
    [ "squares absolute value", "abs(x)^2", "x^2", DEFAULT_VARIABLES ],
    [ "multiplies nested exponents", "(x^2)^3", "x^6", DEFAULT_VARIABLES ],
    [ "evaluates exponent expression", "x^(2+1)", "x^3", DEFAULT_VARIABLES ],
    [ "evaluates constant arithmetic", "2+3*4", "14", [] ]
  ].freeze

  EXPRESSION_CASES.each do |name, submitted, expected, variables|
    test "accepts equivalent expressions: #{name}" do
      result = validate(
        expression_step(expected:, variables:),
        { "expression" => submitted }
      )

      assert_predicate result, :correct?
      assert_nil result.error
    end
  end

  test "validates a single choice" do
    step = choice_step("single_choice", [ "a" ])

    assert_predicate validate(step, { "selectedOptionIds" => [ "a" ] }), :correct?
    assert_not validate(step, { "selectedOptionIds" => [ "b" ] }).correct?
  end

  test "compares multi choice answers as exact sets" do
    step = choice_step("multi_choice", %w[a c])

    assert_predicate validate(step, { "selectedOptionIds" => %w[c a] }), :correct?
    assert_not validate(step, { "selectedOptionIds" => [ "a" ] }).correct?
    assert_not validate(step, { "selectedOptionIds" => %w[a b c] }).correct?
  end

  test "rejects malformed choice answers with structured errors" do
    step = choice_step("single_choice", [ "a" ])

    [ nil, "a", [], %w[a b], [ "a", "a" ], [ 1 ] ].each do |selected|
      result = validate(step, { "selectedOptionIds" => selected })

      assert_not result.correct?
      assert_equal "invalid_answer_format", result.error.to_h[:code]
    end
  end

  test "accepts numeric answers at the absolute tolerance boundary" do
    step = numeric_step(expected: 3.5, tolerance: 0.001)

    assert_predicate validate(step, { "value" => 3.501 }), :correct?
    assert_predicate validate(step, { "value" => "3.499" }), :correct?
    assert_not validate(step, { "value" => 3.502 }).correct?
  end

  test "supports strict decimal and scientific numeric casting" do
    step = numeric_step(expected: 100, tolerance: 0)

    assert_predicate validate(step, { "value" => "1e2" }), :correct?
    assert_predicate validate(step, { "value" => 100 }), :correct?
  end

  test "rejects malformed and non-finite numeric inputs without raising" do
    step = numeric_step(expected: 1, tolerance: 0.001)

    [ nil, true, "", "NaN", "Infinity", "1_000", "1abc", " 1 " ].each do |value|
      result = validate(step, { "value" => value })

      assert_not result.correct?
      assert_equal "invalid_answer_format", result.error.to_h[:code]
    end
  end

  test "rejects close but non-equivalent expressions" do
    step = expression_step(expected: "x", tolerance: 0.001)

    assert_not validate(step, { "expression" => "x+0.002" }).correct?
  end

  test "applies relative expression tolerance" do
    step = expression_step(expected: "1000", variables: [], tolerance: 0.001)

    assert_predicate validate(step, { "expression" => "1000.5" }), :correct?
  end

  test "returns parse position for malformed submitted expressions" do
    step = expression_step(expected: "x")
    result = validate(step, { "expression" => "x + * 2" })

    assert_not result.correct?
    assert_equal "invalid_expression", result.error.to_h[:code]
    assert_equal 4, result.error.position
  end

  test "rejects expression injection payloads" do
    step = expression_step(expected: "x")

    [ "system(x)", "`id`", "Kernel.system(x)", "x; system(x)", "%x(id)" ].each do |payload|
      result = validate(step, { "expression" => payload })

      assert_not result.correct?
      assert result.error
    end
  end

  test "returns a configuration error for invalid expected expressions" do
    step = expression_step(expected: "unknown(x)")
    result = validate(step, { "expression" => "x" })

    assert_not result.correct?
    assert_equal "invalid_step_configuration", result.error.to_h[:code]
  end

  test "returns a configuration error for invalid variable domains" do
    variables = [ { "name" => "x", "domain" => { "min" => 2, "max" => 1 } } ]
    step = expression_step(expected: "x", variables:)
    result = validate(step, { "expression" => "x" })

    assert_not result.correct?
    assert_equal "invalid_step_configuration", result.error.to_h[:code]
  end

  test "enforces expression complexity limits" do
    step = expression_step(expected: "x")
    result = validate(step, { "expression" => "x" * (Validation::Limits::EXPRESSION_MAX_LENGTH + 1) })

    assert_not result.correct?
    assert_equal "expression_limit_exceeded", result.error.to_h[:code]
  end

  test "is deterministic for the same submission" do
    step = expression_step(expected: "x^2+2*x+1")
    answer = { "expression" => "(x+1)^2" }

    results = Array.new(5) { validate(step, answer).to_h }

    assert_equal 1, results.uniq.length
  end

  test "returns structured unsupported type and answer format errors" do
    unsupported = StepDouble.new(answer_type: "matrix")
    unsupported_result = validate(unsupported, {})
    format_result = validate(numeric_step(expected: 1), nil)

    assert_equal(
      { correct: false, error: {
        code: "unsupported_answer_type",
        message: "answer type is not supported"
      } },
      unsupported_result.to_h
    )
    assert_equal "invalid_answer_format", format_result.error.to_h[:code]
  end

  private

  def validate(step, answer)
    Validation::AnswerValidator.call(step:, answer:)
  end

  def choice_step(answer_type, correct_answer)
    StepDouble.new(
      id: 1,
      answer_type:,
      correct_answer:,
      tolerance: 0.001,
      options: %w[a b c].map { |id| { "id" => id, "label" => id.upcase } },
      exercise: ExerciseDouble.new(variables: [])
    )
  end

  def numeric_step(expected:, tolerance: 0.001)
    StepDouble.new(
      id: 2,
      answer_type: "numeric",
      correct_answer: { "value" => expected },
      tolerance:,
      options: [],
      exercise: ExerciseDouble.new(variables: [])
    )
  end

  def expression_step(expected:, variables: DEFAULT_VARIABLES, tolerance: 0.000001)
    StepDouble.new(
      id: 3,
      answer_type: "expression",
      correct_answer: { "expression" => expected },
      tolerance:,
      options: [],
      exercise: ExerciseDouble.new(variables:)
    )
  end
end
