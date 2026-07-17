require "test_helper"

class SubjectTest < ActiveSupport::TestCase
  test "generates a parameterized slug and requires it to be unique" do
    subject = Subject.create!(name: "Álgebra Básica", position: 1)
    duplicate = Subject.new(name: "Otro nombre", slug: subject.slug, position: 2)

    assert_equal "algebra-basica", subject.slug
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:slug], "has already been taken"
  end

  test "requires a positive integer position" do
    subject = Subject.new(name: "Álgebra", position: 0)

    assert_not subject.valid?
    assert subject.errors[:position].any?
  end

  test "destroys topics and supports discard scopes" do
    subject = create_subject
    topic = create_topic(subject:)
    subject.update!(deleted_at: Time.current)

    assert_includes Subject.discarded, subject
    assert_not_includes Subject.kept, subject

    subject.destroy!
    assert_not Topic.exists?(topic.id)
  end
end
