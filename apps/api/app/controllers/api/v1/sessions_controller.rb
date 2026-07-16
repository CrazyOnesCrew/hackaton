module Api
  module V1
    class SessionsController < ApplicationController
      include Api::V1::Concerns::Authenticatable

      skip_before_action :authenticate_request!, only: [ :create ]

      def create
        user = User.kept.find_by(email: login_params[:email].to_s.strip.downcase)

        if user.nil? || !user.authenticate(login_params[:password])
          user&.register_failed_login!
          return render_invalid_credentials
        end

        return render_account_disabled unless user.active?

        user.register_successful_login!
        session = user.sessions.create!

        render json: {
          data: {
            user: user_payload(user),
            session: session_payload(session)
          }
        }, status: :created
      end

      def destroy
        current_session.revoke!
        head :no_content
      end

      private

      def login_params
        params.permit(:email, :password)
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

      def render_invalid_credentials
        render json: {
          error: {
            code: "invalid_credentials",
            message: "Correo o contraseña incorrectos."
          }
        }, status: :unauthorized
      end

      def render_account_disabled
        render json: {
          error: {
            code: "account_disabled",
            message: "Esta cuenta no está activa."
          }
        }, status: :forbidden
      end
    end
  end
end
