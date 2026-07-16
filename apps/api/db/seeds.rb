# frozen_string_literal: true

# Demonstrative seed data for the template. These are example accounts only —
# replace them with your own project's seeds. Never seed real credentials.

demo_users = [
  { email: "admin@example.com", display_name: "Admin Example", role: "admin" },
  { email: "member@example.com", display_name: "Member Example", role: "member" },
  { email: "auxiliary@example.com", display_name: "Auxiliary Example", role: "auxiliary" }
]

demo_password = ENV.fetch("SEED_PASSWORD", "Password123")

demo_users.each do |attrs|
  user = User.find_or_initialize_by(email: attrs[:email])
  user.assign_attributes(attrs.merge(password: demo_password))
  user.save!
  puts "Seeded #{user.role}: #{user.email}"
end

puts "Seed complete: #{User.count} user(s)."
