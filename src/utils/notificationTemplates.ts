// Centraliza todos os templates de notificação para eventos Kiwify/Zappy
const notificationTemplates: Record<string | number, string> = {
  boleto_gerado: 'Olá {{primeiroNome}}, seu boleto está disponível em {{urlBoleto}}.',
  pix_gerado: 'Olá {{primeiroNome}}, seu PIX foi gerado! Código: {{codigoPix}}.',
  compra_aprovada: 'Parabéns {{primeiroNome}}, sua compra foi aprovada!',
  compra_recusada: 'Olá {{primeiroNome}}, infelizmente sua compra foi recusada.',
  carrinho_abandonado: 'Olá {{primeiroNome}}, você deixou produtos no carrinho! Aproveite antes que acabe.',
  subscription_late: 'Olá {{primeiroNome}}, sua assinatura está atrasada. Regularize para continuar aproveitando.',
  subscription_canceled: 'Olá {{primeiroNome}}, sua assinatura foi cancelada.',
  compra_reembolsada: 'Olá {{primeiroNome}}, sua compra foi reembolsada.',
  chargeback: 'Olá {{primeiroNome}}, ocorreu um chargeback em sua compra.',
  subscription_renewed: 'Olá {{primeiroNome}}, sua assinatura foi renovada com sucesso!',
  custom_notification: '{{title}}: {{message}}',
  default: 'Nova notificação do Kiwify! '
};

export default notificationTemplates;
