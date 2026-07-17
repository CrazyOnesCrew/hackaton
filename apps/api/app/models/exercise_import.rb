# == Schema Information
#
# Table name: exercise_imports
# Database name: primary
#
#  id         :bigint           not null, primary key
#  filename   :string           not null
#  raw_xml    :text             not null
#  report     :jsonb            not null
#  status     :integer          default("pending"), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :bigint           not null
#
# Indexes
#
#  index_exercise_imports_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
# Check Constraints
#
#  exercise_imports_status_valid  (status = ANY (ARRAY[0, 1, 2, 3]))
#
class ExerciseImport < ApplicationRecord
  belongs_to :user
  has_many :exercises, dependent: :nullify

  enum :status, { pending: 0, processing: 1, completed: 2, failed: 3 }, default: :pending, validate: true

  validates :filename, :raw_xml, presence: true
  validate :report_must_be_an_object

  private

  def report_must_be_an_object
    errors.add(:report, "must be an object") unless report.is_a?(Hash)
  end
end
