module Api
  module V1
    class RegistrationsController < ApplicationController
      def create
        user = User.new(
          email: registration_params[:email],
          password: registration_params[:password],
          display_name: registration_params[:displayName],
          role: "member"
        )

        if user.save
          session = user.sessions.create!
          render json: {
            data: {
              user: user_payload(user),
              session: session_payload(session)
            }
          }, status: :created
        else
          render_validation_error(user)
        end
      end

      private

      def registration_params
        params.permit(:email, :password, :displayName)
      end

      def user_payload(user)
        {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          role: user.role
        }
      end

      def session_payload(session)
        {
          token: session.token,
          expiresAt: session.expires_at.iso8601
        }
      end

      def render_validation_error(user)
        render json: {
          error: {
            code: "validation_error",
            message: "No fue posible crear la cuenta.",
            details: user.errors.map { |error| { field: error.attribute.to_s, message: error.message } }
          }
        }, status: :unprocessable_content
      end
    end
  end
end
