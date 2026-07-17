require "test_helper"

class ExerciseImportTest < ActiveSupport::TestCase
  test "defines stable statuses and defaults to pending" do
    exercise_import = ExerciseImport.new(
      user: create_user,
      filename: "bank.xml",
      raw_xml: "<exerciseBank version=\"1.0\"/>"
    )

    assert_equal(
      { "pending" => 0, "processing" => 1, "completed" => 2, "failed" => 3 },
      ExerciseImport.statuses
    )
    assert exercise_import.pending?
    assert exercise_import.valid?
  end

  test "requires report to be an object" do
    exercise_import = ExerciseImport.new(
      user: create_user,
      filename: "bank.xml",
      raw_xml: "<exerciseBank version=\"1.0\"/>",
      report: []
    )

    assert_not exercise_import.valid?
    assert exercise_import.errors[:report].any?
  end

  test "keeps imported exercises and nullifies trace when import is destroyed" do
    exercise_import = ExerciseImport.create!(
      user: create_user,
      filename: "bank.xml",
      raw_xml: "<exerciseBank version=\"1.0\"/>"
    )
    exercise = create_exercise(exercise_import:, source: "xml_import")

    exercise_import.destroy!

    assert_nil exercise.reload.exercise_import
    assert exercise.xml_import?
  end
end
