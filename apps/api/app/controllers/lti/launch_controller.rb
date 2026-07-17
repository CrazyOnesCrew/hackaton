# frozen_string_literal: true

module Lti
  class LaunchController < ApplicationController
    # Moodle POSTs the launch cross-site; API-only app has no CSRF middleware by default.

    def create
      unless valid_launch?
        return render json: { error: { message: "Invalid LTI launch signature." } }, status: :unauthorized
      end

      redirect_to student_app_url, allow_other_host: true
    end

    private

    def valid_launch?
      return true if ENV["LTI_DEV_SKIP_VALIDATION"] == "true"

      consumer_key = params["oauth_consumer_key"].to_s
      expected_key = ENV.fetch("LTI_CONSUMER_KEY", "hackaton_local")
      return false unless consumer_key == expected_key

      secret = ENV.fetch("LTI_SHARED_SECRET", "hackaton_local_secret")
      launch_url = ENV.fetch("LTI_LAUNCH_URL", request.url)

      IMS::LTI::Services::MessageAuthenticator.new(
        launch_url,
        request.request_parameters,
        secret
      ).valid_signature?
    end

    def student_app_url
      base = ENV.fetch("APP_WEB_URL", "http://localhost:8081").chomp("/")
      query = {
        lti: "1",
        email: params["lis_person_contact_email_primary"].presence || params["lis_person_contact_email"].presence,
        name: params["lis_person_name_full"].presence || params["lis_person_name_given"].presence,
        role: params["roles"].presence,
        resource_link_id: params["resource_link_id"].presence,
        context_id: params["context_id"].presence
      }.compact

      "#{base}/lti-entry?#{query.to_query}"
    end
  end
end
