module ContentBankTestHelper
  def create_subject(attributes = {})
    suffix = SecureRandom.hex(4)
    Subject.create!({
      name: "Subject #{suffix}",
      position: 1
    }.merge(attributes))
  end

  def create_topic(subject: create_subject, **attributes)
    suffix = SecureRandom.hex(4)
    subject.topics.create!({
      name: "Topic #{suffix}",
      position: 1
    }.merge(attributes))
  end

  def create_exercise(topic: create_topic, **attributes)
    suffix = SecureRandom.hex(4)
    topic.exercises.create!({
      title: "Exercise #{suffix}",
      statement: "Solve $x + 1 = 2$.",
      difficulty: "easy",
      variables: []
    }.merge(attributes))
  end

  def valid_step_attributes
    {
      phase: "identification",
      position: 1,
      prompt: "What kind of equation is this?",
      answer_type: "single_choice",
      options: [
        { "id" => "a", "label" => "Linear" },
        { "id" => "b", "label" => "Quadratic" }
      ],
      correct_answer: [ "a" ]
    }
  end

  def create_step(exercise: create_exercise, **attributes)
    exercise.exercise_steps.create!(valid_step_attributes.merge(attributes))
  end

  def create_user(attributes = {})
    suffix = SecureRandom.hex(4)
    User.create!({
      email: "user-#{suffix}@example.com",
      password: "Password123",
      display_name: "Test User"
    }.merge(attributes))
  end
end
