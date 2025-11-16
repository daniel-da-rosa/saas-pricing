from django.apps import AppConfig

class PricingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pricing'

    # ADICIONE ESTE MÉTODO:
    def ready(self):
        """
        Esta função é chamada pelo Django quando a app 'pricing'
        é carregada. Nós a usamos para importar (e ativar)
        o nosso arquivo de signals.
        """
        import pricing.signals