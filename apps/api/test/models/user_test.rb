require "test_helper"

class UserTest < ActiveSupport::TestCase
  def valid_attrs
    {
      email: "viajero@example.com",
      password: "S3guraP@ss",
      display_name: "Ana",
      role: "member"
    }
  end

  test "valid user saves" do
    user = User.new(valid_attrs)
    assert user.valid?, user.errors.full_messages.to_s
  end

  test "requires email" do
    user = User.new(valid_attrs.merge(email: nil))
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "rejects invalid email format" do
    user = User.new(valid_attrs.merge(email: "not-an-email"))
    assert_not user.valid?
    assert_includes user.errors[:email], "is invalid"
  end

  test "rejects duplicate email case-insensitively" do
    User.create!(valid_attrs)
    duplicate = User.new(valid_attrs.merge(email: "VIAJERO@example.com", display_name: "Otro"))
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], "has already been taken"
  end

  test "normalizes email to lowercase" do
    user = User.create!(valid_attrs.merge(email: "Viajero@Example.com"))
    assert_equal "viajero@example.com", user.email
  end

  test "requires password on create" do
    user = User.new(valid_attrs.merge(password: nil))
    assert_not user.valid?
    assert_includes user.errors[:password], "can't be blank"
  end

  test "rejects weak password" do
    user = User.new(valid_attrs.merge(password: "short"))
    assert_not user.valid?
  end

  test "requires role inclusion" do
    user = User.new(valid_attrs.merge(role: "superuser"))
    assert_not user.valid?
    assert_includes user.errors[:role], "is not included in the list"
  end

  test "defaults status to active" do
    user = User.create!(valid_attrs)
    assert user.active?
  end

  test "register_failed_login! increments attempts and disables after threshold" do
    user = User.create!(valid_attrs)
    User::MAX_FAILED_LOGIN_ATTEMPTS.times { user.register_failed_login! }
    assert_equal User::MAX_FAILED_LOGIN_ATTEMPTS, user.failed_login_attempts
    assert_not user.active?
  end

  test "register_successful_login! resets failed attempts" do
    user = User.create!(valid_attrs)
    2.times { user.register_failed_login! }
    user.register_successful_login!
    assert_equal 0, user.failed_login_attempts
  end
end
