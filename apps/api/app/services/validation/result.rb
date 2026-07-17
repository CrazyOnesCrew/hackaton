module Validation
  class Result
    Error = Struct.new(:code, :message, :position, :details, keyword_init: true) do
      def to_h
        {
          code: code.to_s,
          message:,
          position:,
          details:
        }.compact
      end
    end

    attr_reader :error

    def self.correct
      new(correct: true)
    end

    def self.incorrect(code: nil, message: nil, position: nil, details: nil)
      error = if code
        Error.new(code:, message:, position:, details:).freeze
      end

      new(correct: false, error:)
    end

    def initialize(correct:, error: nil)
      @correct = correct
      @error = error
      freeze
    end

    def correct?
      @correct
    end

    def to_h
      { correct: correct?, error: error&.to_h }
    end
  end
end
