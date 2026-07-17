require "bigdecimal"
require "time"

module Exports
  class GradeCsv
    HEADERS = %w[username email fullname grade lesson completedat].freeze
    FORMULA_PREFIX = /\A[[:space:]]*[=+\-@]/u

    Entry = Data.define(
      :student_id,
      :username,
      :email,
      :fullname,
      :final_score,
      :lesson,
      :completed_at
    )

    class InvalidEntry < ArgumentError
      attr_reader :entry_number, :field

      def initialize(entry_number:, field:, reason:)
        @entry_number = entry_number
        @field = field
        super("entry #{entry_number}: #{field} #{reason}")
      end
    end

    def self.generate(entries)
      new(entries).generate
    end

    def initialize(entries)
      @entries = entries
    end

    def generate
      selected_entries = highest_grade_per_student

      rows = [ HEADERS, *selected_entries.map { |entry| csv_row(entry) } ]
      rows.map { |row| row.map { |value| escape(value) }.join(",") }.join("\r\n") << "\r\n"
    end

    private

    attr_reader :entries

    def highest_grade_per_student
      unless entries.respond_to?(:each)
        raise ArgumentError, "entries must be enumerable"
      end

      entries.each_with_index.with_object({}) do |(raw_entry, index), selected|
        entry = normalize_entry(raw_entry, index + 1)
        current = selected[entry.student_id]

        selected[entry.student_id] = entry if current.nil? || preferred?(entry, current)
      end.values.sort_by do |entry|
        [ entry.username.downcase, entry.email.downcase, entry.student_id.to_s ]
      end
    end

    def preferred?(candidate, current)
      (preference_key(candidate) <=> preference_key(current)).positive?
    end

    def preference_key(entry)
      [ entry.final_score, entry.completed_at, entry.lesson, entry.username, entry.email, entry.fullname ]
    end

    def normalize_entry(raw_entry, entry_number)
      Entry.new(
        student_id: required_value(raw_entry, :student_id, entry_number),
        username: required_text(raw_entry, :username, entry_number),
        email: required_text(raw_entry, :email, entry_number),
        fullname: required_text(raw_entry, :fullname, entry_number),
        final_score: final_score(raw_entry, entry_number),
        lesson: required_text(raw_entry, :lesson, entry_number),
        completed_at: completed_at(raw_entry, entry_number)
      )
    end

    def required_value(raw_entry, field, entry_number)
      value = fetch(raw_entry, field, entry_number)
      return value unless value.nil? || (value.respond_to?(:empty?) && value.empty?)

      invalid_entry!(entry_number, field, "must be present")
    end

    def required_text(raw_entry, field, entry_number)
      value = required_value(raw_entry, field, entry_number).to_s
      value = value.encode(Encoding::UTF_8)
      invalid_entry!(entry_number, field, "must be valid UTF-8") unless value.valid_encoding?

      value
    rescue Encoding::InvalidByteSequenceError, Encoding::UndefinedConversionError
      invalid_entry!(entry_number, field, "must be valid UTF-8")
    end

    def final_score(raw_entry, entry_number)
      value = begin
        BigDecimal(fetch(raw_entry, :final_score, entry_number).to_s)
      rescue ArgumentError
        invalid_entry!(entry_number, :final_score, "must be a number between 0 and 1")
      end
      return value if value.finite? && value.between?(0, 1)

      invalid_entry!(entry_number, :final_score, "must be between 0 and 1")
    end

    def completed_at(raw_entry, entry_number)
      value = fetch(raw_entry, :completed_at, entry_number)
      return value.to_time.utc if value.respond_to?(:to_time)

      invalid_entry!(entry_number, :completed_at, "must be a time")
    end

    def fetch(raw_entry, field, entry_number)
      unless raw_entry.respond_to?(:key?)
        invalid_entry!(entry_number, field, "is unavailable because the entry is not hash-like")
      end

      return raw_entry[field] if raw_entry.key?(field)
      return raw_entry[field.to_s] if raw_entry.key?(field.to_s)

      invalid_entry!(entry_number, field, "is required")
    end

    def invalid_entry!(entry_number, field, reason)
      raise InvalidEntry.new(entry_number:, field:, reason:)
    end

    def csv_row(entry)
      [
        safe_text(entry.username),
        safe_text(entry.email),
        safe_text(entry.fullname),
        format("%.2f", entry.final_score * 100),
        safe_text(entry.lesson),
        entry.completed_at.iso8601
      ]
    end

    def safe_text(value)
      FORMULA_PREFIX.match?(value) ? "'#{value}" : value
    end

    def escape(value)
      return value unless /[",\r\n]/.match?(value)

      %("#{value.gsub('"', '""')}")
    end
  end
end
