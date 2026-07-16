require "test_helper"
require Rails.root.join("db/migrate/20260716000001_change_users_role_to_integer")

class ChangeUsersRoleToIntegerTest < ActiveSupport::TestCase
  test "up preserves existing admin and member roles" do
    with_isolated_schema do |connection|
      connection.create_table(:users) do |table|
        table.string :role, default: "member", null: false
      end
      connection.execute("INSERT INTO users (role) VALUES ('admin'), ('member')")

      ChangeUsersRoleToInteger.new.migrate(:up)

      roles = connection.select_values("SELECT role FROM users ORDER BY role")
      assert_equal [ 0, 1 ], roles
    end
  end

  private

  def with_isolated_schema
    connection = ActiveRecord::Base.connection
    schema = "paag004_migration_#{SecureRandom.hex(6)}"
    quoted_schema = connection.quote_table_name(schema)
    previous_search_path = connection.schema_search_path

    connection.execute("CREATE SCHEMA #{quoted_schema}")
    connection.schema_search_path = schema
    yield connection
  ensure
    connection.schema_search_path = previous_search_path
    connection.execute("DROP SCHEMA IF EXISTS #{quoted_schema} CASCADE")
  end
end
