class Session < ApplicationRecord
  ABSOLUTE_LIFETIME = 30.days
  INACTIVITY_WINDOW = 14.days

  belongs_to :user
  has_secure_token :token

  before_validation :set_expiry, on: :create

  validates :user_id, presence: true
  validates :token, presence: true, uniqueness: true

  def active?
    revoked_at.nil? && expires_at.future? && (last_seen_at.nil? || last_seen_at > INACTIVITY_WINDOW.ago)
  end

  def touch_last_seen!
    update!(last_seen_at: Time.current)
  end

  def revoke!
    update!(revoked_at: Time.current) if revoked_at.nil?
  end

  private

  def set_expiry
    self.expires_at ||= ABSOLUTE_LIFETIME.from_now
    self.last_seen_at ||= Time.current
  end
end
