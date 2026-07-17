class CreateContentBank < ActiveRecord::Migration[8.1]
  def change
    create_table :subjects do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.integer :position, null: false
      t.datetime :deleted_at

      t.timestamps
    end
    add_index :subjects, :slug, unique: true
    add_index :subjects, :deleted_at
    add_check_constraint :subjects, "position > 0", name: "subjects_position_positive"

    create_table :topics do |t|
      t.references :subject, null: false, foreign_key: { on_delete: :cascade }
      t.string :name, null: false
      t.string :slug, null: false
      t.integer :position, null: false
      t.datetime :deleted_at

      t.timestamps
    end
    add_index :topics, %i[subject_id slug], unique: true
    add_index :topics, :deleted_at
    add_check_constraint :topics, "position > 0", name: "topics_position_positive"

    create_table :exercise_imports do |t|
      t.references :user, null: false, foreign_key: true
      t.string :filename, null: false
      t.integer :status, null: false, default: 0
      t.jsonb :report, null: false, default: {}
      t.text :raw_xml, null: false

      t.timestamps
    end
    add_check_constraint :exercise_imports, "status IN (0, 1, 2, 3)", name: "exercise_imports_status_valid"

    create_table :exercises do |t|
      t.references :topic, null: false, foreign_key: { on_delete: :cascade }
      t.references :exercise_import, null: true, foreign_key: { on_delete: :nullify }
      t.string :title, null: false
      t.text :statement, null: false
      t.integer :difficulty, null: false
      t.integer :status, null: false, default: 0
      t.integer :source, null: false, default: 0
      t.jsonb :variables, null: false, default: []
      t.datetime :deleted_at

      t.timestamps
    end
    add_index :exercises, :deleted_at
    add_index :exercises, %i[topic_id difficulty status]
    add_check_constraint :exercises, "difficulty IN (0, 1, 2)", name: "exercises_difficulty_valid"
    add_check_constraint :exercises, "status IN (0, 1, 2)", name: "exercises_status_valid"
    add_check_constraint :exercises, "source IN (0, 1)", name: "exercises_source_valid"

    create_table :exercise_steps do |t|
      t.references :exercise, null: false, foreign_key: { on_delete: :cascade }
      t.integer :phase, null: false
      t.integer :position, null: false
      t.text :prompt, null: false
      t.integer :answer_type, null: false
      t.jsonb :options, null: false, default: []
      t.jsonb :correct_answer, null: false
      t.decimal :tolerance, null: false, default: 0.001
      t.integer :max_score, null: false, default: 10

      t.timestamps
    end
    add_index :exercise_steps, %i[exercise_id position], unique: true
    add_check_constraint :exercise_steps, "phase IN (0, 1, 2, 3)", name: "exercise_steps_phase_valid"
    add_check_constraint :exercise_steps, "answer_type IN (0, 1, 2, 3)", name: "exercise_steps_answer_type_valid"
    add_check_constraint :exercise_steps, "position > 0", name: "exercise_steps_position_positive"
    add_check_constraint :exercise_steps, "tolerance >= 0", name: "exercise_steps_tolerance_nonnegative"
    add_check_constraint :exercise_steps, "max_score > 0", name: "exercise_steps_max_score_positive"

    create_table :hints do |t|
      t.references :exercise_step, null: false, foreign_key: { on_delete: :cascade }
      t.integer :position, null: false
      t.text :content, null: false
      t.integer :penalty, null: false, default: 2

      t.timestamps
    end
    add_index :hints, %i[exercise_step_id position], unique: true
    add_check_constraint :hints, "position > 0", name: "hints_position_positive"
    add_check_constraint :hints, "penalty >= 0", name: "hints_penalty_nonnegative"
  end
end
