module Validation
  class ExpressionEquivalence
    def initialize(
      variables:,
      tolerance:,
      seed:,
      sample_count: Limits::SAMPLE_COUNT,
      max_attempts: nil,
      deadline: nil,
      rng: nil
    )
      @domains = normalize_domains(variables)
      @tolerance = normalize_tolerance(tolerance)
      @sample_count = sample_count
      @max_attempts = max_attempts || sample_count * 3
      @deadline = deadline
      @rng = rng || Random.new(seed)
    end

    def call(submitted_ast:, expected_ast:)
      valid_samples = 0
      attempts = 0

      while valid_samples < @sample_count && attempts < @max_attempts
        @deadline&.check!
        attempts += 1
        bindings = sample_bindings

        begin
          submitted = ExpressionEvaluator.evaluate(submitted_ast, bindings, deadline: @deadline)
          expected = ExpressionEvaluator.evaluate(expected_ast, bindings, deadline: @deadline)
        rescue EvaluationError
          next
        end

        return Result.incorrect unless equivalent_values?(submitted, expected)

        valid_samples += 1
      end

      if valid_samples == @sample_count
        Result.correct
      else
        Result.incorrect(
          code: :insufficient_valid_samples,
          message: "could not find enough valid points in the declared variable domains",
          details: {
            validSamples: valid_samples,
            requiredSamples: @sample_count,
            attempts:
          }
        )
      end
    end

    private

    def normalize_domains(variables)
      domains = Array(variables).map do |variable|
        unless variable.is_a?(Hash)
          raise ConfigurationError, "each variable definition must be an object"
        end

        name = variable["name"] || variable[:name]
        domain = variable["domain"] || variable[:domain]
        minimum = domain&.[]("min") || domain&.[](:min)
        maximum = domain&.[]("max") || domain&.[](:max)

        unless valid_variable?(name, minimum, maximum)
          raise ConfigurationError, "variable domains must have a name and finite min/max values"
        end

        [ name.to_s, minimum.to_f, maximum.to_f ]
      end
      names = domains.map(&:first)
      raise ConfigurationError, "variable names must be unique" unless names.uniq.length == names.length

      domains
    end

    def valid_variable?(name, minimum, maximum)
      return false unless name.is_a?(String) && name.match?(/\A[A-Za-z_][A-Za-z0-9_]*\z/)
      return false unless finite_numeric?(minimum) && finite_numeric?(maximum)

      minimum < maximum
    end

    def normalize_tolerance(tolerance)
      unless finite_numeric?(tolerance) && tolerance >= 0
        raise ConfigurationError, "tolerance must be a finite non-negative number"
      end

      tolerance.to_f
    end

    def finite_numeric?(value)
      value.is_a?(Numeric) && !value.is_a?(Complex) && value.to_f.finite?
    end

    def sample_bindings
      @domains.to_h do |name, minimum, maximum|
        [ name, minimum + (@rng.rand * (maximum - minimum)) ]
      end
    end

    def equivalent_values?(submitted, expected)
      (submitted - expected).abs <= @tolerance * [ 1.0, expected.abs ].max
    end
  end
end
