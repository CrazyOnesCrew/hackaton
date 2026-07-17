# == Schema Information
#
# Table name: topics
# Database name: primary
#
#  id         :bigint           not null, primary key
#  deleted_at :datetime
#  name       :string           not null
#  position   :integer          not null
#  slug       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  subject_id :bigint           not null
#
# Indexes
#
#  index_topics_on_deleted_at           (deleted_at)
#  index_topics_on_subject_id           (subject_id)
#  index_topics_on_subject_id_and_slug  (subject_id,slug) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (subject_id => subjects.id) ON DELETE => cascade
#
# Check Constraints
#
#  topics_position_positive  ("position" > 0)
#
class Topic < ApplicationRecord
  include Discardable

  belongs_to :subject
  has_many :exercises, -> { order(:position) }, dependent: :destroy, inverse_of: :topic

  before_validation :generate_slug, if: -> { slug.blank? && name.present? }

  validates :name, :slug, presence: true
  validates :slug, uniqueness: { scope: :subject_id }
  validates :position, numericality: { only_integer: true, greater_than: 0 }

  private

  def generate_slug
    self.slug = name.parameterize
  end
end
