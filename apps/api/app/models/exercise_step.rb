# == Schema Information
#
# Table name: exercise_steps
# Database name: primary
#
#  id             :bigint           not null, primary key
#  answer_type    :integer          not null
#  correct_answer :jsonb            not null
#  max_score      :integer          default(10), not null
#  options        :jsonb            not null
#  phase          :integer          not null
#  position       :integer          not null
#  prompt         :text             not null
#  tolerance      :decimal(, )      default(0.001), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  exercise_id    :bigint           not null
#
# Indexes
#
#  index_exercise_steps_on_exercise_id               (exercise_id)
#  index_exercise_steps_on_exercise_id_and_position  (exercise_id,position) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (exercise_id => exercises.id) ON DELETE => cascade
#
# Check Constraints
#
#  exercise_steps_answer_type_valid      (answer_type = ANY (ARRAY[0, 1, 2, 3]))
#  exercise_steps_max_score_positive     (max_score > 0)
#  exercise_steps_phase_valid            (phase = ANY (ARRAY[0, 1, 2, 3]))
#  exercise_steps_position_positive      ("position" > 0)
#  exercise_steps_tolerance_nonnegative  (tolerance >= 0::numeric)
#
class ExerciseStep < ApplicationRecord
  belongs_to :exercise, inverse_of: :exercise_steps
  has_many :hints, -> { order(:position) }, dependent: :destroy, inverse_of: :exercise_step

  enum :phase, { identification: 0, planning: 1, tools: 2, procedure: 3 }, validate: true
  enum :answer_type, { single_choice: 0, multi_choice: 1, numeric: 2, expression: 3 }, validate: true

  validates :prompt, presence: true
  validates :position,
    numericality: { only_integer: true, greater_than: 0 },
    uniqueness: { scope: :exercise_id }
  validates :tolerance, numericality: { greater_than_or_equal_to: 0 }
  validates :max_score, numericality: { only_integer: true, greater_than: 0 }
  validate :options_must_match_answer_type
  validate :correct_answer_must_match_answer_type

  private

  def options_must_match_answer_type
    unless options.is_a?(Array)
      errors.add(:options, "must be an array")
      return
    end

    if choice_answer_type?
      errors.add(:options, "must contain at least one option") if options.empty?
      errors.add(:options, "must contain unique id and label objects") unless valid_options?
    elsif options.any?
      errors.add(:options, "must be empty for non-choice answers")
    end
  end

  def correct_answer_must_match_answer_type
    case answer_type
    when "single_choice"
      validate_choice_answer(expected_size: 1)
    when "multi_choice"
      validate_choice_answer
    when "numeric"
      validate_object_answer("value", Numeric)
    when "expression"
      validate_expression_answer
    end
  end

  def choice_answer_type?
    single_choice? || multi_choice?
  end

  def valid_options?
    ids = options.filter_map { |option| option["id"] if valid_option?(option) }
    ids.size == options.size && ids.uniq.size == ids.size
  end

  def valid_option?(option)
    option.is_a?(Hash) && option["id"].present? && option["label"].present?
  end

  def validate_choice_answer(expected_size: nil)
    valid = correct_answer.is_a?(Array) && correct_answer.any? &&
      correct_answer.all? { |id| id.is_a?(String) && id.present? } &&
      correct_answer.uniq.size == correct_answer.size
    valid &&= correct_answer.size == expected_size if expected_size
    valid &&= (correct_answer - option_ids).empty? if options.is_a?(Array)

    errors.add(:correct_answer, "must contain valid option ids") unless valid
  end

  def option_ids
    options.filter_map { |option| option["id"] if option.is_a?(Hash) }
  end

  def validate_object_answer(key, value_class)
    valid = correct_answer.is_a?(Hash) &&
      correct_answer.keys.map(&:to_s) == [ key ] &&
      correct_answer[key].is_a?(value_class)
    errors.add(:correct_answer, "must be an object with a numeric #{key}") unless valid
  end

  def validate_expression_answer
    valid = correct_answer.is_a?(Hash) &&
      correct_answer.keys.map(&:to_s) == [ "expression" ] &&
      correct_answer["expression"].is_a?(String) &&
      correct_answer["expression"].present?
    errors.add(:correct_answer, "must be an object with a non-empty expression") unless valid
  end
end
