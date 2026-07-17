require "test_helper"

class Validation::ExpressionParserTest < ActiveSupport::TestCase
  def parse(source, variables: %w[x y])
    Validation::ExpressionParser.parse(source, variables:)
  end

  def evaluate(source, bindings = { "x" => 2, "y" => 3 })
    Validation::ExpressionEvaluator.eval(parse(source), bindings)
  end

  test "applies standard arithmetic precedence" do
    assert_equal 14.0, evaluate("2 + 3 * 4")
    assert_equal 20.0, evaluate("(2 + 3) * 4")
  end

  test "makes exponentiation right associative" do
    assert_equal 512.0, evaluate("2^3^2")
  end

  test "gives exponentiation precedence over unary minus" do
    assert_equal(-4.0, evaluate("-2^2"))
    assert_equal 4.0, evaluate("(-2)^2")
    assert_in_delta 0.25, evaluate("2^-2")
  end

  test "accepts every whitelisted function" do
    source = "sin(x)+cos(x)+tan(x)+log(x)+ln(x)+sqrt(x)+abs(x)+exp(x)"

    assert_instance_of Validation::ExpressionParser::BinaryNode, parse(source)
  end

  test "accepts decimals and scientific notation" do
    assert_in_delta 101.25, evaluate(".25 + 1e2 + 1.")
  end

  test "rejects undeclared variables with a position" do
    error = assert_raises(Validation::ParseError) { parse("x + z") }

    assert_equal 4, error.position
    assert_match(/unknown variable/, error.message)
  end

  test "rejects unknown functions before parsing arguments" do
    error = assert_raises(Validation::ParseError) { parse("system(x)") }

    assert_equal 0, error.position
    assert_match(/unknown variable or function/, error.message)
  end

  test "rejects backticks as invalid tokens" do
    error = assert_raises(Validation::ParseError) { parse("`id`") }

    assert_equal 0, error.position
    assert_match(/invalid token/, error.message)
  end

  test "rejects Ruby constant and method syntax" do
    assert_raises(Validation::ParseError) { parse("Kernel.system(x)") }
    assert_raises(Validation::ParseError) { parse("x.__send__(y)") }
    assert_raises(Validation::ParseError) { parse("x; y") }
  end

  test "reports missing closing parenthesis" do
    error = assert_raises(Validation::ParseError) { parse("(x + 1") }

    assert_equal 6, error.position
    assert_match(/expected '\)'/, error.message)
  end

  test "reports unexpected adjacent expressions" do
    error = assert_raises(Validation::ParseError) { parse("2x") }

    assert_equal 1, error.position
  end

  test "rejects empty and non-string expressions" do
    assert_raises(Validation::ParseError) { parse("   ") }
    assert_raises(Validation::ParseError) { parse(nil) }
  end

  test "enforces expression length" do
    error = assert_raises(Validation::ParseError) do
      Validation::ExpressionParser.parse("1" * 20, variables: [], max_length: 10)
    end

    assert_equal :expression_limit_exceeded, error.code
  end

  test "enforces token count" do
    error = assert_raises(Validation::ParseError) do
      Validation::ExpressionParser.parse("1+2+3", variables: [], token_limit: 3)
    end

    assert_equal :expression_limit_exceeded, error.code
  end

  test "enforces nesting depth" do
    error = assert_raises(Validation::ParseError) do
      Validation::ExpressionParser.parse("(((1)))", variables: [], max_depth: 2)
    end

    assert_equal :expression_limit_exceeded, error.code
  end

  test "honors the validation deadline" do
    times = [ 0.0, 1.0 ]
    deadline = Validation::Deadline.new(seconds: 0.1, clock: -> { times.shift || 1.0 })

    assert_raises(Validation::TimeoutError) do
      Validation::ExpressionParser.parse("1 + 2", variables: [], deadline:)
    end
  end
end
