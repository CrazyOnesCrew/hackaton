class AddPositionToExercises < ActiveRecord::Migration[8.1]
  def up
    add_column :exercises, :position, :integer

    execute <<~SQL.squish
      WITH ranked_exercises AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY topic_id ORDER BY created_at, id) AS position
        FROM exercises
      )
      UPDATE exercises
      SET position = ranked_exercises.position
      FROM ranked_exercises
      WHERE exercises.id = ranked_exercises.id
    SQL

    change_column_null :exercises, :position, false
    add_index :exercises, %i[topic_id position], unique: true
    add_check_constraint :exercises, "position > 0", name: "exercises_position_positive"
  end

  def down
    remove_check_constraint :exercises, name: "exercises_position_positive"
    remove_index :exercises, %i[topic_id position]
    remove_column :exercises, :position
  end
end
