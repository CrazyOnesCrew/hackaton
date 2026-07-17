require "test_helper"

class Validation::ExpressionEvaluatorTest < ActiveSupport::TestCase
  def evaluate(source, bindings = {}, variables: bindings.keys)
    ast = Validation::ExpressionParser.parse(source, variables:)
    Validation::ExpressionEvaluator.eval(ast, bindings)
  end

  test "evaluates arithmetic and variables" do
    assert_equal 11.0, evaluate("2*x + y", { "x" => 4, "y" => 3 })
  end

  test "accepts symbol binding keys" do
    assert_equal 5.0, evaluate("x + 1", { x: 4 }, variables: [ "x" ])
  end

  test "evaluates trigonometric functions" do
    assert_in_delta 1.0, evaluate("sin(0) + cos(0) + tan(0)")
  end

  test "evaluates logarithmic and exponential functions" do
    assert_in_delta 3.0, evaluate("ln(exp(2)) + log(exp(1))")
  end

  test "evaluates square root and absolute value" do
    assert_equal 7.0, evaluate("sqrt(9) + abs(-4)")
  end

  test "rejects division by zero" do
    assert_raises(Validation::EvaluationError) { evaluate("1 / x", { "x" => 0 }) }
  end

  test "rejects invalid logarithm domain" do
    assert_raises(Validation::EvaluationError) { evaluate("ln(-1)") }
    assert_raises(Validation::EvaluationError) { evaluate("log(0)") }
  end

  test "rejects invalid square root domain" do
    assert_raises(Validation::EvaluationError) { evaluate("sqrt(-1)") }
  end

  test "rejects complex exponentiation results" do
    assert_raises(Validation::EvaluationError) { evaluate("(-1)^0.5") }
  end

  test "rejects non-finite results" do
    assert_raises(Validation::EvaluationError) { evaluate("exp(1000)") }
  end

  test "rejects missing and non-numeric bindings" do
    ast = Validation::ExpressionParser.parse("x", variables: [ "x" ])

    assert_raises(Validation::EvaluationError) { Validation::ExpressionEvaluator.eval(ast, {}) }
    assert_raises(Validation::EvaluationError) do
      Validation::ExpressionEvaluator.eval(ast, { "x" => "1" })
    end
  end

  test "enforces operation limit" do
    ast = Validation::ExpressionParser.parse("1 + 2 + 3", variables: [])

    assert_raises(Validation::EvaluationError) do
      Validation::ExpressionEvaluator.eval(ast, {}, operation_limit: 2)
    end
  end

  test "honors the validation deadline" do
    ast = Validation::ExpressionParser.parse("1 + 2", variables: [])
    times = [ 0.0, 1.0 ]
    deadline = Validation::Deadline.new(seconds: 0.1, clock: -> { times.shift || 1.0 })

    assert_raises(Validation::TimeoutError) do
      Validation::ExpressionEvaluator.eval(ast, {}, deadline:)
    end
  end
end
