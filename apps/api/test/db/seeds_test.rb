require "test_helper"

class SeedsTest < ActiveSupport::TestCase
  test "creates admin member and auxiliary users" do
    original_seed_password = ENV["SEED_PASSWORD"]
    ENV["SEED_PASSWORD"] = "SeedPassword123"
    load Rails.root.join("db/seeds.rb")

    assert_equal "admin", User.find_by!(email: "admin@example.com").role
    assert_equal "member", User.find_by!(email: "member@example.com").role
    assert_equal "auxiliary", User.find_by!(email: "auxiliary@example.com").role
  ensure
    ENV["SEED_PASSWORD"] = original_seed_password
  end
end
