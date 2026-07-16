class ChangeUsersRoleToInteger < ActiveRecord::Migration[8.1]
  def up
    change_column_default :users, :role, from: "member", to: nil
    change_column :users, :role, :integer,
      using: "CASE role WHEN 'admin' THEN 0 WHEN 'member' THEN 1 END",
      default: 1,
      null: false
  end

  def down
    change_column_default :users, :role, from: 1, to: nil
    change_column :users, :role, :string,
      using: "CASE role WHEN 0 THEN 'admin' WHEN 1 THEN 'member' WHEN 2 THEN 'auxiliary' END",
      default: "member",
      null: false
  end
end
