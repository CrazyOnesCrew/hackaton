module Validation
  class ExpressionParser
    FUNCTIONS = %w[sin cos tan log ln sqrt abs exp].freeze
    IDENTIFIER_PATTERN = /\A[A-Za-z_][A-Za-z0-9_]*/
    NUMBER_PATTERN = /\A(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/

    Token = Struct.new(:type, :value, :position, keyword_init: true)
    NumberNode = Struct.new(:value, keyword_init: true)
    VariableNode = Struct.new(:name, keyword_init: true)
    UnaryNode = Struct.new(:operator, :operand, keyword_init: true)
    BinaryNode = Struct.new(:operator, :left, :right, keyword_init: true)
    FunctionNode = Struct.new(:name, :argument, keyword_init: true)

    def self.parse(source, variables:, **options)
      new(source, variables:, **options).parse
    end

    def initialize(
      source,
      variables:,
      max_length: Limits::EXPRESSION_MAX_LENGTH,
      token_limit: Limits::EXPRESSION_MAX_TOKENS,
      max_depth: Limits::EXPRESSION_MAX_DEPTH,
      deadline: nil
    )
      @source = source
      @variables = Array(variables).map(&:to_s).to_h { |name| [ name, true ] }
      @max_length = max_length
      @token_limit = token_limit
      @max_depth = max_depth
      @deadline = deadline
      @depth = 0
    end

    def parse
      validate_source!
      @tokens = tokenize
      @index = 0

      expression = parse_addition
      token = current_token
      raise_parse_error("unexpected token #{token.value.inspect}", token.position) unless token.type == :eof

      expression
    end

    private

    def validate_source!
      unless @source.is_a?(String)
        raise ParseError.new("expression must be a string", position: 0)
      end
      if @source.length > @max_length
        raise ParseError.new(
          "expression exceeds the maximum length of #{@max_length}",
          position: @max_length,
          code: :expression_limit_exceeded
        )
      end
      if @source.strip.empty?
        raise ParseError.new("expression cannot be empty", position: 0)
      end
    end

    def tokenize
      tokens = []
      position = 0

      while position < @source.length
        check_deadline!
        character = @source[position]

        if character.match?(/\s/)
          position += 1
          next
        end

        remainder = @source[position..]
        match = NUMBER_PATTERN.match(remainder)
        if match
          tokens << Token.new(type: :number, value: match[0], position:)
          position += match[0].length
          check_token_limit!(tokens, position)
          next
        end

        match = IDENTIFIER_PATTERN.match(remainder)
        if match
          tokens << Token.new(type: :identifier, value: match[0], position:)
          position += match[0].length
          check_token_limit!(tokens, position)
          next
        end

        type = token_type(character)
        raise_parse_error("invalid token #{character.inspect}", position) unless type

        tokens << Token.new(type:, value: character, position:)
        position += 1
        check_token_limit!(tokens, position)
      end

      tokens << Token.new(type: :eof, value: nil, position: @source.length)
      tokens
    end

    def token_type(character)
      {
        "+" => :plus,
        "-" => :minus,
        "*" => :multiply,
        "/" => :divide,
        "^" => :power,
        "(" => :left_parenthesis,
        ")" => :right_parenthesis
      }[character]
    end

    def check_token_limit!(tokens, position)
      return unless tokens.length > @token_limit

      raise ParseError.new(
        "expression exceeds the maximum token count of #{@token_limit}",
        position:,
        code: :expression_limit_exceeded
      )
    end

    def parse_addition
      left = parse_multiplication

      while match?(:plus, :minus)
        operator = previous_token.value
        left = BinaryNode.new(operator:, left:, right: parse_multiplication)
      end

      left
    end

    def parse_multiplication
      left = parse_unary

      while match?(:multiply, :divide)
        operator = previous_token.value
        left = BinaryNode.new(operator:, left:, right: parse_unary)
      end

      left
    end

    def parse_unary
      if match?(:plus, :minus)
        token = previous_token
        return within_depth(token.position) do
          UnaryNode.new(operator: token.value, operand: parse_unary)
        end
      end

      parse_power
    end

    def parse_power
      left = parse_primary
      return left unless match?(:power)

      token = previous_token
      within_depth(token.position) do
        BinaryNode.new(operator: token.value, left:, right: parse_unary)
      end
    end

    def parse_primary
      token = current_token

      if match?(:number)
        return NumberNode.new(value: strict_float(token))
      end

      if match?(:identifier)
        return parse_identifier(token)
      end

      if match?(:left_parenthesis)
        return within_depth(token.position) do
          expression = parse_addition
          consume!(:right_parenthesis, "expected ')' to close group")
          expression
        end
      end

      raise_parse_error("expected a number, variable, function, or '('", token.position)
    end

    def parse_identifier(token)
      name = token.value

      if FUNCTIONS.include?(name)
        consume!(:left_parenthesis, "expected '(' after function #{name}")
        return within_depth(token.position) do
          argument = parse_addition
          consume!(:right_parenthesis, "expected ')' after function argument")
          FunctionNode.new(name:, argument:)
        end
      end

      unless @variables.key?(name)
        raise_parse_error("unknown variable or function #{name.inspect}", token.position)
      end

      VariableNode.new(name:)
    end

    def strict_float(token)
      value = Float(token.value)
      raise_parse_error("number must be finite", token.position) unless value.finite?

      value
    rescue ArgumentError, RangeError
      raise_parse_error("invalid number", token.position)
    end

    def within_depth(position)
      @depth += 1
      if @depth > @max_depth
        raise ParseError.new(
          "expression exceeds the maximum nesting depth of #{@max_depth}",
          position:,
          code: :expression_limit_exceeded
        )
      end

      yield
    ensure
      @depth -= 1
    end

    def match?(*types)
      return false unless types.include?(current_token.type)

      advance
      true
    end

    def consume!(type, message)
      token = current_token
      raise_parse_error(message, token.position) unless token.type == type

      advance
    end

    def advance
      check_deadline!
      @index += 1 unless current_token.type == :eof
      previous_token
    end

    def current_token
      @tokens[@index]
    end

    def previous_token
      @tokens[@index - 1]
    end

    def check_deadline!
      @deadline&.check!
    end

    def raise_parse_error(message, position)
      raise ParseError.new(message, position:)
    end
  end
end
