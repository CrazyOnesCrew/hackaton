# == Schema Information
#
# Table name: hints
# Database name: primary
#
#  id               :bigint           not null, primary key
#  content          :text             not null
#  penalty          :integer          default(2), not null
#  position         :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  exercise_step_id :bigint           not null
#
# Indexes
#
#  index_hints_on_exercise_step_id               (exercise_step_id)
#  index_hints_on_exercise_step_id_and_position  (exercise_step_id,position) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (exercise_step_id => exercise_steps.id) ON DELETE => cascade
#
# Check Constraints
#
#  hints_penalty_nonnegative  (penalty >= 0)
#  hints_position_positive    ("position" > 0)
#
class Hint < ApplicationRecord
  belongs_to :exercise_step, inverse_of: :hints

  validates :content, presence: true
  validates :position,
    numericality: { only_integer: true, greater_than: 0 },
    uniqueness: { scope: :exercise_step_id }
  validates :penalty, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
