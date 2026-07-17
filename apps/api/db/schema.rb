# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_07_16_000003) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "exercise_imports", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.text "raw_xml", null: false
    t.jsonb "report", default: {}, null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_exercise_imports_on_user_id"
    t.check_constraint "status = ANY (ARRAY[0, 1, 2, 3])", name: "exercise_imports_status_valid"
  end

  create_table "exercise_steps", force: :cascade do |t|
    t.integer "answer_type", null: false
    t.jsonb "correct_answer", null: false
    t.datetime "created_at", null: false
    t.bigint "exercise_id", null: false
    t.integer "max_score", default: 10, null: false
    t.jsonb "options", default: [], null: false
    t.integer "phase", null: false
    t.integer "position", null: false
    t.text "prompt", null: false
    t.decimal "tolerance", default: "0.001", null: false
    t.datetime "updated_at", null: false
    t.index ["exercise_id", "position"], name: "index_exercise_steps_on_exercise_id_and_position", unique: true
    t.index ["exercise_id"], name: "index_exercise_steps_on_exercise_id"
    t.check_constraint "\"position\" > 0", name: "exercise_steps_position_positive"
    t.check_constraint "answer_type = ANY (ARRAY[0, 1, 2, 3])", name: "exercise_steps_answer_type_valid"
    t.check_constraint "max_score > 0", name: "exercise_steps_max_score_positive"
    t.check_constraint "phase = ANY (ARRAY[0, 1, 2, 3])", name: "exercise_steps_phase_valid"
    t.check_constraint "tolerance >= 0::numeric", name: "exercise_steps_tolerance_nonnegative"
  end

  create_table "exercises", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.integer "difficulty", null: false
    t.bigint "exercise_import_id"
    t.integer "position", null: false
    t.integer "source", default: 0, null: false
    t.text "statement", null: false
    t.integer "status", default: 0, null: false
    t.string "title", null: false
    t.bigint "topic_id", null: false
    t.datetime "updated_at", null: false
    t.jsonb "variables", default: [], null: false
    t.index ["deleted_at"], name: "index_exercises_on_deleted_at"
    t.index ["exercise_import_id"], name: "index_exercises_on_exercise_import_id"
    t.index ["topic_id", "difficulty", "status"], name: "index_exercises_on_topic_id_and_difficulty_and_status"
    t.index ["topic_id", "position"], name: "index_exercises_on_topic_id_and_position", unique: true
    t.index ["topic_id"], name: "index_exercises_on_topic_id"
    t.check_constraint "\"position\" > 0", name: "exercises_position_positive"
    t.check_constraint "difficulty = ANY (ARRAY[0, 1, 2])", name: "exercises_difficulty_valid"
    t.check_constraint "source = ANY (ARRAY[0, 1])", name: "exercises_source_valid"
    t.check_constraint "status = ANY (ARRAY[0, 1, 2])", name: "exercises_status_valid"
  end

  create_table "hints", force: :cascade do |t|
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.bigint "exercise_step_id", null: false
    t.integer "penalty", default: 2, null: false
    t.integer "position", null: false
    t.datetime "updated_at", null: false
    t.index ["exercise_step_id", "position"], name: "index_hints_on_exercise_step_id_and_position", unique: true
    t.index ["exercise_step_id"], name: "index_hints_on_exercise_step_id"
    t.check_constraint "\"position\" > 0", name: "hints_position_positive"
    t.check_constraint "penalty >= 0", name: "hints_penalty_nonnegative"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.datetime "last_seen_at", null: false
    t.datetime "revoked_at"
    t.string "token", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["token"], name: "index_sessions_on_token", unique: true
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "subjects", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.string "name", null: false
    t.integer "position", null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["deleted_at"], name: "index_subjects_on_deleted_at"
    t.index ["slug"], name: "index_subjects_on_slug", unique: true
    t.check_constraint "\"position\" > 0", name: "subjects_position_positive"
  end

  create_table "topics", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.string "name", null: false
    t.integer "position", null: false
    t.string "slug", null: false
    t.bigint "subject_id", null: false
    t.datetime "updated_at", null: false
    t.index ["deleted_at"], name: "index_topics_on_deleted_at"
    t.index ["subject_id", "slug"], name: "index_topics_on_subject_id_and_slug", unique: true
    t.index ["subject_id"], name: "index_topics_on_subject_id"
    t.check_constraint "\"position\" > 0", name: "topics_position_positive"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.string "display_name", null: false
    t.string "email", null: false
    t.integer "failed_login_attempts", default: 0, null: false
    t.string "password_digest", null: false
    t.integer "role", default: 1, null: false
    t.string "status", default: "active", null: false
    t.datetime "updated_at", null: false
    t.index ["deleted_at"], name: "index_users_on_deleted_at"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "exercise_imports", "users"
  add_foreign_key "exercise_steps", "exercises", on_delete: :cascade
  add_foreign_key "exercises", "exercise_imports", on_delete: :nullify
  add_foreign_key "exercises", "topics", on_delete: :cascade
  add_foreign_key "hints", "exercise_steps", on_delete: :cascade
  add_foreign_key "sessions", "users"
  add_foreign_key "topics", "subjects", on_delete: :cascade
end
