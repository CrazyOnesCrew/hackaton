# == Schema Information
#
# Table name: exercises
# Database name: primary
#
#  id                 :bigint           not null, primary key
#  deleted_at         :datetime
#  difficulty         :integer          not null
#  source             :integer          default("manual"), not null
#  statement          :text             not null
#  status             :integer          default("draft"), not null
#  title              :string           not null
#  variables          :jsonb            not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  exercise_import_id :bigint
#  topic_id           :bigint           not null
#
# Indexes
#
#  index_exercises_on_deleted_at                          (deleted_at)
#  index_exercises_on_exercise_import_id                  (exercise_import_id)
#  index_exercises_on_topic_id                            (topic_id)
#  index_exercises_on_topic_id_and_difficulty_and_status  (topic_id,difficulty,status)
#
# Foreign Keys
#
#  fk_rails_...  (exercise_import_id => exercise_imports.id) ON DELETE => nullify
#  fk_rails_...  (topic_id => topics.id) ON DELETE => cascade
#
# Check Constraints
#
#  exercises_difficulty_valid  (difficulty = ANY (ARRAY[0, 1, 2]))
#  exercises_source_valid      (source = ANY (ARRAY[0, 1]))
#  exercises_status_valid      (status = ANY (ARRAY[0, 1, 2]))
#
class Exercise < ApplicationRecord
  include Discardable

  belongs_to :topic
  belongs_to :exercise_import, optional: true
  has_many :exercise_steps, -> { order(:position) }, dependent: :destroy, inverse_of: :exercise

  enum :difficulty, { easy: 0, medium: 1, hard: 2 }, validate: true
  enum :status, { draft: 0, published: 1, archived: 2 }, default: :draft, validate: true
  enum :source, { manual: 0, xml_import: 1 }, default: :manual, validate: true

  scope :by_difficulty, ->(difficulty) { where(difficulty:) }

  validates :title, :statement, presence: true
  validate :variables_must_have_valid_shape
  validate :must_be_publishable, if: :publishing?

  def publishable?
    steps = exercise_steps.to_a
    steps.any?(&:procedure?) && steps.all? { |step| step.correct_answer.present? }
  end

  private

  def publishing?
    will_save_change_to_status? && published?
  end

  def must_be_publishable
    return if publishable?

    errors.add(:status, "cannot be published without a procedure step and complete answers")
  end

  def variables_must_have_valid_shape
    unless variables.is_a?(Array)
      errors.add(:variables, "must be an array")
      return
    end

    return if variables.all? { |variable| valid_variable?(variable) }

    errors.add(:variables, "must contain names and numeric domains where min is less than max")
  end

  def valid_variable?(variable)
    return false unless variable.is_a?(Hash)

    name = variable["name"]
    domain = variable["domain"]
    return false if name.blank? || !domain.is_a?(Hash)

    minimum = domain["min"]
    maximum = domain["max"]
    minimum.is_a?(Numeric) && maximum.is_a?(Numeric) && minimum < maximum
  end
end
