from django.db import transaction
from users.models import Empresa
import logging

logger = logging.getLogger(__name__)

@transaction.atomic
def gerar_proximo_codigo(empresa_id: int, chave: str, prefixo: str, digitos: int = 6) -> str:
    """
    Função genérica e atômica para gerar qualquer código sequencial.
    
    :param empresa_id: ID da empresa (int)
    :param chave: A chave única do contador (ex: 'SKU_PA')
    :param prefixo: O texto que vem antes do número (ex: 'PA')
    :param digitos: Quantos zeros à esquerda (ex: 6 -> '000001')
    :return: Código completo formatado (ex: 'PA000001')
    """
    from core.models import ContadorSequencia  # Import local
    
    try:
        # Valida que a empresa existe
        empresa = Empresa.objects.get(id=empresa_id)
        
        # Busca ou cria o contador com lock no banco
        sequencia, criado = ContadorSequencia.objects.select_for_update().get_or_create(
            empresa=empresa,
            chave=chave,
            defaults={'ultimo_numero': 0}
        )
        
        # Log se foi criado um novo contador
        if criado:
            logger.info(f"Novo contador criado: {chave} para empresa {empresa.nome_fantasia}")
        
        # Incrementa o número
        sequencia.ultimo_numero += 1
        sequencia.save(update_fields=['ultimo_numero'])
        
        # Formata o número com zeros à esquerda
        numero_formatado = str(sequencia.ultimo_numero).zfill(digitos)
        
        # Retorna o código completo
        codigo_final = f"{prefixo}{numero_formatado}"
        
        logger.debug(f"Código gerado: {codigo_final} (chave: {chave})")
        
        return codigo_final
        
    except Empresa.DoesNotExist:
        erro = f"Empresa com ID {empresa_id} não encontrada"
        logger.error(erro)
        raise ValueError(erro)
    except Exception as e:
        erro = f"Erro ao gerar sequência para chave '{chave}': {str(e)}"
        logger.error(erro)
        raise ValueError(erro)
