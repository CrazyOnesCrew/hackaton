require "test_helper"

class Validation::ExpressionEquivalenceTest < ActiveSupport::TestCase
  SequenceRandom = Struct.new(:values) do
    def rand
      values.shift || 0.5
    end
  end

  test "discards singular samples and retries up to a valid sample" do
    variables = [ { "name" => "x", "domain" => { "min" => -1, "max" => 1 } } ]
    submitted = parse("1/x", variables)
    expected = parse("1/x", variables)
    rng = SequenceRandom.new([ 0.5, 0.75 ])

    result = Validation::ExpressionEquivalence.new(
      variables:,
      tolerance: 0.001,
      seed: 1,
      sample_count: 1,
      max_attempts: 2,
      rng:
    ).call(submitted_ast: submitted, expected_ast: expected)

    assert_predicate result, :correct?
  end

  test "fails closed when three times the required samples are all invalid" do
    variables = [ { "name" => "x", "domain" => { "min" => -1, "max" => 1 } } ]
    submitted = parse("1/x", variables)
    expected = parse("1/x", variables)
    rng = SequenceRandom.new(Array.new(6, 0.5))

    result = Validation::ExpressionEquivalence.new(
      variables:,
      tolerance: 0.001,
      seed: 1,
      sample_count: 2,
      rng:
    ).call(submitted_ast: submitted, expected_ast: expected)

    assert_not result.correct?
    assert_equal "insufficient_valid_samples", result.error.to_h[:code]
    assert_equal 6, result.error.details[:attempts]
  end

  test "uses relative tolerance against the expected value" do
    submitted = parse("1000.5", [])
    expected = parse("1000", [])

    result = Validation::ExpressionEquivalence.new(
      variables: [],
      tolerance: 0.001,
      seed: 1,
      sample_count: 1
    ).call(submitted_ast: submitted, expected_ast: expected)

    assert_predicate result, :correct?
  end

  test "rejects malformed variable domains" do
    error = assert_raises(Validation::ConfigurationError) do
      Validation::ExpressionEquivalence.new(
        variables: [ { "name" => "x", "domain" => { "min" => 1, "max" => 1 } } ],
        tolerance: 0.001,
        seed: 1
      )
    end

    assert_match(/variable domains/, error.message)
  end

  test "rejects invalid tolerance configuration" do
    assert_raises(Validation::ConfigurationError) do
      Validation::ExpressionEquivalence.new(variables: [], tolerance: -1, seed: 1)
    end
  end

  private

  def parse(source, variables)
    names = variables.filter_map { |variable| variable["name"] }
    Validation::ExpressionParser.parse(source, variables: names)
  end
end
