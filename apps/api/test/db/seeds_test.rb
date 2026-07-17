require "test_helper"

class SeedsTest < ActiveSupport::TestCase
  test "creates users and a complete idempotent content bank" do
    original_seed_password = ENV["SEED_PASSWORD"]
    ENV["SEED_PASSWORD"] = "SeedPassword123"
    2.times { load Rails.root.join("db/seeds.rb") }

    assert_equal "admin", User.find_by!(email: "admin@example.com").role
    assert_equal "member", User.find_by!(email: "member@example.com").role
    assert_equal "auxiliary", User.find_by!(email: "auxiliary@example.com").role
    assert_equal 3, User.count

    assert_equal 2, Subject.count
    assert_equal 4, Topic.count
    assert_equal 10, Exercise.count
    assert_equal 40, ExerciseStep.count
    assert_equal 50, Hint.count
    assert_equal 10, Exercise.published.count
    assert ExerciseStep.numeric.exists?
    assert ExerciseStep.expression.exists?

    Exercise.published.find_each do |exercise|
      assert_equal %w[identification planning tools procedure], exercise.exercise_steps.map(&:phase)
      assert exercise.publishable?
      assert exercise.exercise_steps.all? { |step| step.hints.any? }
    end
  ensure
    ENV["SEED_PASSWORD"] = original_seed_password
  end
end
