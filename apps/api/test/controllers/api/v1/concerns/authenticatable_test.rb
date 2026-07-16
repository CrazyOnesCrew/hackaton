require "test_helper"

module Api
  module V1
    module Concerns
      class ContentManagerAuthorizationController < ApplicationController
        include Authenticatable

        before_action :require_content_manager!

        def show
          head :no_content
        end
      end

      class AuthenticatableTest < ActionController::TestCase
        tests ContentManagerAuthorizationController

        setup do
          @routes = ActionDispatch::Routing::RouteSet.new
          @routes.draw do
            get "content-manager-authorization",
              to: "api/v1/concerns/content_manager_authorization#show"
          end
        end

        test "allows auxiliary users to manage content" do
          authorize_as("auxiliary")

          get :show

          assert_response :no_content
        end

        test "allows admin users to manage content" do
          authorize_as("admin")

          get :show

          assert_response :no_content
        end

        test "rejects member users from content management" do
          authorize_as("member")

          get :show

          assert_response :forbidden
          assert_equal "forbidden", response.parsed_body["error"]["code"]
        end

        private

        def authorize_as(role)
          user = create_user(role: role)
          session = user.sessions.create!
          @request.headers["Authorization"] = "Bearer #{session.token}"
        end
      end
    end
  end
end
