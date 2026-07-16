module AuthTestHelper
  def create_user(role: "member", email: "user-#{SecureRandom.hex(4)}@example.test", display_name: "Test User")
    User.create!(email: email, password: "Password123", display_name: display_name, role: role)
  end

  def auth_headers(user: create_user)
    session = user.sessions.create!
    [ { "Authorization" => "Bearer #{session.token}" }, user ]
  end

  def admin_auth_headers
    auth_headers(user: create_user(role: "admin")).first
  end
end
