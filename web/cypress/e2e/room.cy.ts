describe('Room Creation and Join Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should create a room and display join code', () => {
    // Wait for games to load
    cy.contains('Select Game').should('be.visible');
    
    // Create room
    cy.contains('Create Room').click();
    
    // Should navigate to room page
    cy.url().should('include', '/room/');
    
    // Should show join code
    cy.contains('Join Code:').should('be.visible');
  });

  it('should display QR code in lobby', () => {
    cy.contains('Create Room').click();
    
    // Should show QR code
    cy.get('svg').should('be.visible'); // QR code is rendered as SVG
  });
});

