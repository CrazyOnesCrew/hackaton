class User < ApplicationRecord
  include Discardable

  STATUSES = %w[active disabled].freeze
  MAX_FAILED_LOGIN_ATTEMPTS = 5
  EMAIL_FORMAT = URI::MailTo::EMAIL_REGEXP
  PASSWORD_MIN_LENGTH = 8

  enum :role, { admin: 0, member: 1, auxiliary: 2 }, default: :member, validate: true

  has_secure_password
  has_many :sessions, dependent: :destroy

  before_validation :normalize_email

  validates :email, presence: true, uniqueness: { case_sensitive: false }, format: { with: EMAIL_FORMAT }
  validates :password, length: { minimum: PASSWORD_MIN_LENGTH }, format: {
    with: /\A(?=.*[a-zA-Z])(?=.*\d).+\z/,
    message: "must include at least one letter and one number"
  }, if: -> { password.present? }
  validates :password, presence: true, on: :create
  validates :role, presence: true
  validates :display_name, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }

  def active?
    status == "active"
  end

  def register_failed_login!
    increment!(:failed_login_attempts)
    update!(status: "disabled") if failed_login_attempts >= MAX_FAILED_LOGIN_ATTEMPTS
  end

  def register_successful_login!
    update!(failed_login_attempts: 0) if failed_login_attempts.positive?
  end

  # Soft delete: hides the account, blocks login (kept? is checked at auth
  # time), and revokes every active session. Bypasses validations deliberately
  # — this is an administrative flag flip, not a business-rule edit.
  def discard!
    return if discarded?

    transaction do
      update_columns(deleted_at: Time.current, status: "disabled")
      sessions.destroy_all
    end
  end

  private

  def normalize_email
    self.email = email.to_s.strip.downcase if email.present?
  end
end
