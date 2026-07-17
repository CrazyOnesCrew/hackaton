# == Schema Information
#
# Table name: subjects
# Database name: primary
#
#  id         :bigint           not null, primary key
#  deleted_at :datetime
#  name       :string           not null
#  position   :integer          not null
#  slug       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_subjects_on_deleted_at  (deleted_at)
#  index_subjects_on_slug        (slug) UNIQUE
#
# Check Constraints
#
#  subjects_position_positive  ("position" > 0)
#
class Subject < ApplicationRecord
  include Discardable

  has_many :topics, dependent: :destroy

  before_validation :generate_slug, if: -> { slug.blank? && name.present? }

  validates :name, :slug, presence: true
  validates :slug, uniqueness: true
  validates :position, numericality: { only_integer: true, greater_than: 0 }

  private

  def generate_slug
    self.slug = name.parameterize
  end
end
