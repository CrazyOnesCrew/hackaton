ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

Dir[Rails.root.join("test/support/**/*.rb")].sort.each { |file| require file }

class ActiveSupport::TestCase
  include AuthTestHelper

  # Keep the default gate deterministic locally; CI can opt into more workers.
  parallelize(workers: ENV.fetch("PARALLEL_WORKERS", 1).to_i)

  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  # fixtures :all
end

class ActionDispatch::IntegrationTest
  include AuthTestHelper
end
