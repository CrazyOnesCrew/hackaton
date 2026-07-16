module Api
  module V1
    # Generic, unauthenticated metadata endpoint. Useful as a smoke test and as
    # an example of the standard `{ data: ... }` response envelope.
    class InfoController < ApplicationController
      def show
        render json: {
          data: {
            name: ENV.fetch("APP_NAME", "AI-First Project Template"),
            environment: Rails.env,
            apiVersion: "v1",
            time: Time.current.utc.iso8601
          }
        }, status: :ok
      end
    end
  end
end
