module Validation
  class ExpressionEvaluator
    FUNCTION_IMPLEMENTATIONS = {
      "sin" => ->(value) { Math.sin(value) },
      "cos" => ->(value) { Math.cos(value) },
      "tan" => ->(value) { Math.tan(value) },
      "log" => ->(value) { Math.log(value) },
      "ln" => ->(value) { Math.log(value) },
      "sqrt" => ->(value) { Math.sqrt(value) },
      "abs" => ->(value) { value.abs },
      "exp" => ->(value) { Math.exp(value) }
    }.freeze

    def self.evaluate(ast, bindings, **options)
      new(bindings, **options).evaluate(ast)
    end

    class << self
      alias_method :eval, :evaluate
    end

    def initialize(
      bindings,
      operation_limit: Limits::EVALUATION_MAX_OPERATIONS,
      deadline: nil
    )
      @bindings = bindings
      @operation_limit = operation_limit
      @deadline = deadline
      @operations = 0
    end

    def evaluate(node)
      count_operation!

      value = case node
      when ExpressionParser::NumberNode
        node.value
      when ExpressionParser::VariableNode
        variable_value(node.name)
      when ExpressionParser::UnaryNode
        evaluate_unary(node)
      when ExpressionParser::BinaryNode
        evaluate_binary(node)
      when ExpressionParser::FunctionNode
        evaluate_function(node)
      else
        raise EvaluationError, "unknown expression node"
      end

      finite_float(value)
    rescue Math::DomainError, FloatDomainError, ZeroDivisionError, RangeError
      raise EvaluationError, "expression is undefined for these variable values"
    end

    private

    def variable_value(name)
      value = if @bindings.key?(name)
        @bindings[name]
      elsif @bindings.key?(name.to_sym)
        @bindings[name.to_sym]
      else
        raise EvaluationError, "missing binding for variable #{name}"
      end

      finite_float(value)
    end

    def evaluate_unary(node)
      value = evaluate(node.operand)

      case node.operator
      when "+"
        value
      when "-"
        -value
      else
        raise EvaluationError, "unsupported unary operator"
      end
    end

    def evaluate_binary(node)
      left = evaluate(node.left)
      right = evaluate(node.right)

      case node.operator
      when "+"
        left + right
      when "-"
        left - right
      when "*"
        left * right
      when "/"
        raise EvaluationError, "division by zero" if right.zero?

        left / right
      when "^"
        left**right
      else
        raise EvaluationError, "unsupported binary operator"
      end
    end

    def evaluate_function(node)
      implementation = FUNCTION_IMPLEMENTATIONS[node.name]
      raise EvaluationError, "unsupported function" unless implementation

      implementation.call(evaluate(node.argument))
    end

    def finite_float(value)
      unless value.is_a?(Numeric) && !value.is_a?(Complex)
        raise EvaluationError, "expression did not produce a real number"
      end

      float = value.to_f
      raise EvaluationError, "expression did not produce a finite number" unless float.finite?

      float
    end

    def count_operation!
      @deadline&.check!
      @operations += 1
      return if @operations <= @operation_limit

      raise EvaluationError, "expression exceeds the evaluation operation limit"
    end
  end
end
