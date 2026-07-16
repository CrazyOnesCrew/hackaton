module Api
  module V1
    module Concerns
      module Authenticatable
        extend ActiveSupport::Concern

        included do
          before_action :authenticate_request!
        end

        def current_session
          @current_session
        end

        def current_user
          @current_user
        end

        private

        def authenticate_request!
          token = bearer_token
          @current_session = token.present? ? Session.find_by(token: token) : nil

          if @current_session.nil? || !@current_session.active?
            render_unauthorized
            return
          end

          # Defense in depth: User#discard! already destroys every session for
          # the user it discards, so this should be unreachable in practice —
          # but a soft-deleted user must never be able to act through a
          # session that outlived it for any reason.
          if @current_session.user.nil? || @current_session.user.discarded?
            render_unauthorized
            return
          end

          @current_session.touch_last_seen!
          @current_user = @current_session.user
        end

        def bearer_token
          header = request.headers["Authorization"]
          return nil if header.blank?

          scheme, token = header.split(" ", 2)
          token if scheme == "Bearer" && token.present?
        end

        def require_role(*roles)
          return if current_user && roles.map(&:to_s).include?(current_user.role)

          render json: {
            error: {
              code: "forbidden",
              message: "No tiene permisos para realizar esta acción."
            }
          }, status: :forbidden
        end

        def require_content_manager!
          require_role(:auxiliary, :admin)
        end

        def render_unauthorized
          render json: {
            error: {
              code: "unauthorized",
              message: "Autenticación requerida o inválida."
            }
          }, status: :unauthorized
        end
      end
    end
  end
end
