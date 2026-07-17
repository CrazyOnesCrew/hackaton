require "test_helper"

class ExerciseTest < ActiveSupport::TestCase
  test "defines stable enums and scopes published exercises by difficulty" do
    assert_equal({ "easy" => 0, "medium" => 1, "hard" => 2 }, Exercise.difficulties)
    assert_equal({ "draft" => 0, "published" => 1, "archived" => 2 }, Exercise.statuses)
    assert_equal({ "manual" => 0, "xml_import" => 1 }, Exercise.sources)

    easy = publish_exercise(create_exercise(difficulty: "easy"))
    hard = publish_exercise(create_exercise(difficulty: "hard"))
    create_exercise(difficulty: "hard")

    assert_equal [ easy ], Exercise.published.by_difficulty(:easy).to_a
    assert_equal [ hard ], Exercise.published.by_difficulty(:hard).to_a
  end

  test "validates variables shape" do
    exercise = create_exercise

    exercise.variables = [ { "name" => "x", "domain" => { "min" => -2, "max" => 2 } } ]
    assert exercise.valid?

    exercise.variables = [ { "name" => "x", "domain" => { "min" => 2, "max" => -2 } } ]
    assert_not exercise.valid?
    assert exercise.errors[:variables].any?
  end

  test "requires a procedure step before publishing" do
    exercise = create_exercise
    create_step(exercise:)

    assert_not exercise.publishable?
    assert_not exercise.update(status: "published")
    assert exercise.errors[:status].any?
  end

  test "publishes a complete exercise" do
    exercise = create_exercise
    create_step(exercise:)
    create_step(
      exercise:,
      phase: "procedure",
      position: 2,
      prompt: "What is x?",
      answer_type: "numeric",
      options: [],
      correct_answer: { "value" => 1 }
    )

    assert exercise.publishable?
    assert exercise.update(status: "published")
  end

  test "assigns positions sequentially within each topic" do
    topic = create_topic
    first = create_exercise(topic:)
    second = create_exercise(topic:)
    other_topic_exercise = create_exercise(topic: create_topic)

    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal 1, other_topic_exercise.position

    second.position = first.position
    assert_not second.valid?
    assert second.errors[:position].any?
  end

  test "destroys steps and supports discard scopes" do
    exercise = create_exercise
    step = create_step(exercise:)
    exercise.update!(deleted_at: Time.current)

    assert_includes Exercise.discarded, exercise
    assert_not_includes Exercise.kept, exercise

    exercise.destroy!
    assert_not ExerciseStep.exists?(step.id)
  end

  private

  def publish_exercise(exercise)
    create_step(
      exercise:,
      phase: "procedure",
      answer_type: "numeric",
      options: [],
      correct_answer: { "value" => 1 }
    )
    exercise.update!(status: "published")
    exercise
  end
end
