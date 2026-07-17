require "test_helper"

class TopicTest < ActiveSupport::TestCase
  test "generates slugs unique within a subject" do
    first_subject = create_subject
    second_subject = create_subject
    first = create_topic(subject: first_subject, name: "Ecuaciones Lineales")
    duplicate = first_subject.topics.new(name: "Otro", slug: first.slug, position: 2)
    same_slug_elsewhere = second_subject.topics.new(name: "Ecuaciones Lineales", position: 1)

    assert_equal "ecuaciones-lineales", first.slug
    assert_not duplicate.valid?
    assert same_slug_elsewhere.valid?
  end

  test "destroys exercises and supports discard scopes" do
    topic = create_topic
    exercise = create_exercise(topic:)
    topic.update!(deleted_at: Time.current)

    assert_includes Topic.discarded, topic
    assert_not_includes Topic.kept, topic

    topic.destroy!
    assert_not Exercise.exists?(exercise.id)
  end
end
