require "test_helper"

class Exports::GradeCsvTest < ActiveSupport::TestCase
  test "generates the exact contractual header and formats grades and UTC timestamps" do
    csv = Exports::GradeCsv.generate([
      entry(
        username: "jperez",
        email: "jperez@example.com",
        fullname: "Juan Pérez",
        final_score: "0.855",
        lesson: "ecuaciones-lineales",
        completed_at: Time.new(2026, 7, 16, 12, 30, 0, "-06:00")
      )
    ])

    assert_equal Encoding::UTF_8, csv.encoding
    assert_equal(
      "username,email,fullname,grade,lesson,completedat\r\n" \
        "jperez,jperez@example.com,Juan Pérez,85.50,ecuaciones-lineales,2026-07-16T18:30:00Z\r\n",
      csv
    )
  end

  test "exports only the highest grade per student in deterministic username order" do
    csv = Exports::GradeCsv.generate([
      entry(student_id: 1, username: "zoe", final_score: "0.70", lesson: "lesson-a"),
      entry(student_id: 2, username: "Ana", final_score: "0.80", lesson: "lesson-b"),
      entry(student_id: 1, username: "zoe", final_score: "0.95", lesson: "lesson-c")
    ])

    assert_equal(
      "username,email,fullname,grade,lesson,completedat\r\n" \
        "Ana,student@example.com,Student Name,80.00,lesson-b,2026-07-16T18:30:00Z\r\n" \
        "zoe,student@example.com,Student Name,95.00,lesson-c,2026-07-16T18:30:00Z\r\n",
      csv
    )
  end

  test "uses the latest completion to break an equal-grade tie" do
    csv = Exports::GradeCsv.generate([
      entry(
        student_id: 1,
        final_score: "0.90",
        lesson: "older-lesson",
        completed_at: Time.utc(2026, 7, 15, 10)
      ),
      entry(
        student_id: 1,
        final_score: "0.90",
        lesson: "newer-lesson",
        completed_at: Time.utc(2026, 7, 16, 10)
      )
    ])

    assert_includes csv, ",90.00,newer-lesson,"
    assert_not_includes csv, "older-lesson"
  end

  test "returns a header-only CSV for an empty context" do
    assert_equal(
      "username,email,fullname,grade,lesson,completedat\r\n",
      Exports::GradeCsv.generate([])
    )
  end

  test "escapes CSV metacharacters and preserves UTF-8 text" do
    csv = Exports::GradeCsv.generate([
      entry(
        username: "alumna,1",
        fullname: "Ángela \"García\"\nSegundo apellido",
        lesson: "álgebra, básica"
      )
    ])
    assert_equal(
      "username,email,fullname,grade,lesson,completedat\r\n" \
        "\"alumna,1\",student@example.com,\"Ángela \"\"García\"\"\nSegundo apellido\"," \
        "75.00,\"álgebra, básica\",2026-07-16T18:30:00Z\r\n",
      csv
    )
    assert csv.valid_encoding?
  end

  test "neutralizes spreadsheet formulas in every textual column" do
    csv = Exports::GradeCsv.generate([
      entry(
        username: "=1+1",
        email: "+cmd@example.com",
        fullname: " @SUM(1)",
        lesson: "-2+3"
      )
    ])

    assert_equal(
      "username,email,fullname,grade,lesson,completedat\r\n" \
        "'=1+1,'+cmd@example.com,' @SUM(1),75.00,'-2+3,2026-07-16T18:30:00Z\r\n",
      csv
    )
  end

  test "rejects missing fields before producing a partial export" do
    error = assert_raises(Exports::GradeCsv::InvalidEntry) do
      Exports::GradeCsv.generate([ entry.except(:email) ])
    end

    assert_equal 1, error.entry_number
    assert_equal :email, error.field
    assert_equal "entry 1: email is required", error.message
  end

  test "rejects invalid scores and encodings with contextual errors" do
    score_error = assert_raises(Exports::GradeCsv::InvalidEntry) do
      Exports::GradeCsv.generate([ entry(final_score: "1.01") ])
    end
    encoding_error = assert_raises(Exports::GradeCsv::InvalidEntry) do
      invalid_utf8 = String.new("\xFF", encoding: Encoding::UTF_8)
      Exports::GradeCsv.generate([ entry(fullname: invalid_utf8) ])
    end

    assert_equal :final_score, score_error.field
    assert_equal "entry 1: final_score must be between 0 and 1", score_error.message
    assert_equal :fullname, encoding_error.field
    assert_equal "entry 1: fullname must be valid UTF-8", encoding_error.message
  end

  private

  def entry(**overrides)
    {
      student_id: 10,
      username: "student",
      email: "student@example.com",
      fullname: "Student Name",
      final_score: "0.75",
      lesson: "lesson",
      completed_at: Time.utc(2026, 7, 16, 18, 30)
    }.merge(overrides)
  end
end
