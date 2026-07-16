class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :role, null: false, default: "member"
      t.string :display_name, null: false
      t.string :status, null: false, default: "active"
      t.integer :failed_login_attempts, null: false, default: 0
      t.datetime :deleted_at

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :deleted_at
  end
end
