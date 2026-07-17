require "bigdecimal"
require "digest"
require "json"

module Validation
  class AnswerValidator
    NUMERIC_PATTERN = /\A[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?\z/

    def self.call(step:, answer:)
      new(step:, answer:).call
    end

    def initialize(step:, answer:)
      @step = step
      @answer = answer
    end

    def call
      return format_error("answer must be an object") unless @answer.is_a?(Hash)

      case @step.answer_type.to_s
      when "single_choice"
        validate_choice(single: true)
      when "multi_choice"
        validate_choice(single: false)
      when "numeric"
        validate_numeric
      when "expression"
        validate_expression
      else
        Result.incorrect(
          code: :unsupported_answer_type,
          message: "answer type is not supported"
        )
      end
    rescue TimeoutError
      Result.incorrect(
        code: :validation_timeout,
        message: "expression validation exceeded its time limit"
      )
    rescue ConfigurationError => error
      Result.incorrect(
        code: :invalid_step_configuration,
        message: error.message
      )
    end

    private

    def validate_choice(single:)
      selected_ids = value_for(@answer, "selectedOptionIds")
      unless selected_ids.is_a?(Array) &&
          selected_ids.all? { |id| id.is_a?(String) && !id.empty? } &&
          selected_ids.uniq.length == selected_ids.length
        return format_error("selectedOptionIds must contain unique non-empty strings")
      end
      if single && selected_ids.length != 1
        return format_error("single choice answers must select exactly one option")
      end

      expected_ids = @step.correct_answer
      unless expected_ids.is_a?(Array) &&
          expected_ids.all? { |id| id.is_a?(String) && !id.empty? } &&
          expected_ids.uniq.length == expected_ids.length
        raise ConfigurationError, "choice correct_answer must contain unique option ids"
      end
      if single && expected_ids.length != 1
        raise ConfigurationError, "single choice correct_answer must contain exactly one option id"
      end

      selected_ids.sort == expected_ids.sort ? Result.correct : Result.incorrect
    end

    def validate_numeric
      submitted = strict_decimal(value_for(@answer, "value"))
      return format_error("value must be a finite number") unless submitted

      expected = strict_decimal(value_for(@step.correct_answer, "value"))
      tolerance = strict_decimal(@step.tolerance)
      unless expected && tolerance && tolerance >= 0
        raise ConfigurationError, "numeric expected value and tolerance must be valid numbers"
      end

      (submitted - expected).abs <= tolerance ? Result.correct : Result.incorrect
    end

    def validate_expression
      submitted_source = value_for(@answer, "expression")
      unless submitted_source.is_a?(String)
        return format_error("expression must be a string")
      end

      expected_source = value_for(@step.correct_answer, "expression")
      unless expected_source.is_a?(String) && !expected_source.strip.empty?
        raise ConfigurationError, "expression correct_answer must contain an expression"
      end

      variables = exercise_variables
      variable_names = variables.filter_map do |variable|
        variable["name"] || variable[:name] if variable.is_a?(Hash)
      end
      deadline = Deadline.new(seconds: Limits::EXPRESSION_TIMEOUT_SECONDS)

      submitted_ast = parse_submitted_expression(submitted_source, variable_names, deadline)
      return submitted_ast if submitted_ast.is_a?(Result)

      expected_ast = parse_expected_expression(expected_source, variable_names, deadline)
      return expected_ast if expected_ast.is_a?(Result)

      ExpressionEquivalence.new(
        variables:,
        tolerance: @step.tolerance,
        seed: deterministic_seed(submitted_source, expected_source, variables),
        deadline:
      ).call(submitted_ast:, expected_ast:)
    end

    def parse_submitted_expression(source, variable_names, deadline)
      ExpressionParser.parse(source, variables: variable_names, deadline:)
    rescue ParseError => error
      Result.incorrect(
        code: error.code,
        message: error.message,
        position: error.position
      )
    end

    def parse_expected_expression(source, variable_names, deadline)
      ExpressionParser.parse(source, variables: variable_names, deadline:)
    rescue ParseError => error
      Result.incorrect(
        code: :invalid_step_configuration,
        message: "expected expression is invalid",
        position: error.position,
        details: { reason: error.message }
      )
    end

    def exercise_variables
      variables = @step.exercise&.variables
      raise ConfigurationError, "exercise variables must be an array" unless variables.is_a?(Array)

      variables
    end

    def strict_decimal(value)
      string = case value
      when String
        value
      when Numeric
        return if value.is_a?(Complex)

        value.to_s
      else
        return
      end
      return unless string.match?(NUMERIC_PATTERN)

      BigDecimal(string, exception: false)
    end

    def deterministic_seed(submitted, expected, variables)
      payload = canonical_json(
        answer: submitted,
        expected:,
        stepId: @step.respond_to?(:id) ? @step.id : nil,
        variables:
      )
      Digest::SHA256.digest(payload).unpack1("Q>")
    end

    def canonical_json(value)
      normalized = case value
      when Hash
        value.keys.sort_by(&:to_s).to_h { |key| [ key.to_s, canonical_json_value(value[key]) ] }
      else
        canonical_json_value(value)
      end

      JSON.generate(normalized)
    end

    def canonical_json_value(value)
      case value
      when Hash
        value.keys.sort_by(&:to_s).to_h { |key| [ key.to_s, canonical_json_value(value[key]) ] }
      when Array
        value.map { |item| canonical_json_value(item) }
      else
        value
      end
    end

    def value_for(object, key)
      return unless object.is_a?(Hash)

      object[key] || object[key.to_sym]
    end

    def format_error(message)
      Result.incorrect(code: :invalid_answer_format, message:)
    end
  end
end
