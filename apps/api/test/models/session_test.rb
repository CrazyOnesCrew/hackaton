require "test_helper"

class SessionTest < ActiveSupport::TestCase
  setup do
    @user = User.create!(email: "viajero@example.com", password: "S3guraP@ss", display_name: "Ana", role: "member")
  end

  test "valid session saves with generated token and defaults" do
    session = @user.sessions.create!
    assert session.persisted?
    assert session.token.present?
    assert session.expires_at.present?
    assert session.last_seen_at.present?
  end

  test "active? is true for a freshly created session" do
    session = @user.sessions.create!
    assert session.active?
  end

  test "active? is false once revoked" do
    session = @user.sessions.create!
    session.revoke!
    assert_not session.active?
  end

  test "active? is false once expired" do
    session = @user.sessions.create!
    session.update!(expires_at: 1.minute.ago)
    assert_not session.active?
  end

  test "active? is false after the inactivity window" do
    session = @user.sessions.create!
    session.update!(last_seen_at: (Session::INACTIVITY_WINDOW + 1.day).ago)
    assert_not session.active?
  end

  test "revoke! is idempotent" do
    session = @user.sessions.create!
    session.revoke!
    first_revoked_at = session.revoked_at
    session.revoke!
    assert_equal first_revoked_at, session.reload.revoked_at
  end

  test "touch_last_seen! updates last_seen_at" do
    session = @user.sessions.create!
    previous = session.last_seen_at
    travel 1.hour do
      session.touch_last_seen!
    end
    assert session.last_seen_at > previous
  end
end
