module Validation
  class ParseError < StandardError
    attr_reader :position, :code

    def initialize(message, position:, code: :invalid_expression)
      super(message)
      @position = position
      @code = code
    end
  end
end
