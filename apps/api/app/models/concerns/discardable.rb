module Discardable
  extend ActiveSupport::Concern

  included do
    scope :kept, -> { where(deleted_at: nil) }
    scope :discarded, -> { where.not(deleted_at: nil) }
  end

  def kept?
    deleted_at.nil?
  end

  def discarded?
    !kept?
  end
end
