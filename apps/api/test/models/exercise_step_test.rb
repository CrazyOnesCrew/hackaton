require "test_helper"

class ExerciseStepTest < ActiveSupport::TestCase
  test "defines stable phase and answer type enums" do
    assert_equal(
      { "identification" => 0, "planning" => 1, "tools" => 2, "procedure" => 3 },
      ExerciseStep.phases
    )
    assert_equal(
      { "single_choice" => 0, "multi_choice" => 1, "numeric" => 2, "expression" => 3 },
      ExerciseStep.answer_types
    )
  end

  test "requires non-empty options for choice answers" do
    step = ExerciseStep.new(valid_step_attributes.merge(exercise: create_exercise, options: []))

    assert_not step.valid?
    assert step.errors[:options].any?
  end

  test "requires choice answers to reference existing unique option ids" do
    step = ExerciseStep.new(
      valid_step_attributes.merge(exercise: create_exercise, correct_answer: [ "missing" ])
    )

    assert_not step.valid?
    assert step.errors[:correct_answer].any?
  end

  test "validates numeric answer shape and rejects options" do
    exercise = create_exercise
    valid = ExerciseStep.new(
      valid_step_attributes.merge(
        exercise:,
        phase: "procedure",
        answer_type: "numeric",
        options: [],
        correct_answer: { "value" => 3.5 }
      )
    )
    invalid = ExerciseStep.new(
      valid_step_attributes.merge(
        exercise:,
        phase: "procedure",
        position: 2,
        answer_type: "numeric",
        correct_answer: { "value" => "3.5" }
      )
    )

    assert valid.valid?, valid.errors.full_messages.to_s
    assert_not invalid.valid?
    assert invalid.errors[:options].any?
    assert invalid.errors[:correct_answer].any?
  end

  test "validates expression answer shape" do
    step = ExerciseStep.new(
      valid_step_attributes.merge(
        exercise: create_exercise,
        phase: "procedure",
        answer_type: "expression",
        options: [],
        correct_answer: { "expression" => "" }
      )
    )

    assert_not step.valid?
    assert step.errors[:correct_answer].any?
  end

  test "accepts multiple selected ids for multi choice answers" do
    step = ExerciseStep.new(
      valid_step_attributes.merge(
        exercise: create_exercise,
        answer_type: "multi_choice",
        correct_answer: %w[a b]
      )
    )

    assert step.valid?, step.errors.full_messages.to_s
  end

  test "requires position to be unique within an exercise" do
    exercise = create_exercise
    create_step(exercise:)
    duplicate = ExerciseStep.new(valid_step_attributes.merge(exercise:))

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:position], "has already been taken"
  end

  test "destroys hints" do
    step = create_step
    hint = step.hints.create!(position: 1, content: "Review inverse operations.")

    step.destroy!
    assert_not Hint.exists?(hint.id)
  end
end
