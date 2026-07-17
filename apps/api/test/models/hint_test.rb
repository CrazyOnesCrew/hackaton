require "test_helper"

class HintTest < ActiveSupport::TestCase
  test "requires content positive position and nonnegative penalty" do
    hint = Hint.new(exercise_step: create_step, content: "", position: 0, penalty: -1)

    assert_not hint.valid?
    assert hint.errors[:content].any?
    assert hint.errors[:position].any?
    assert hint.errors[:penalty].any?
  end

  test "requires position to be unique within a step" do
    step = create_step
    step.hints.create!(content: "First hint", position: 1)
    duplicate = step.hints.new(content: "Another hint", position: 1)

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:position], "has already been taken"
  end
end
