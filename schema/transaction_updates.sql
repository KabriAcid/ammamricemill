-- Update transactions table to support proper head references and statuses
ALTER TABLE transactions 
  ADD COLUMN party_id INT NULL,
  ADD COLUMN from_head_id INT NULL,
  ADD COLUMN from_head_type ENUM('income', 'expense', 'bank', 'others') NULL,
  ADD COLUMN to_head_id INT NULL,
  ADD COLUMN to_head_type ENUM('income', 'expense', 'bank', 'others') NULL,
  MODIFY COLUMN type ENUM('receive', 'payment', 'transfer') NOT NULL,
  MODIFY COLUMN status ENUM('pending', 'completed', 'cancelled', 'inactive') NOT NULL DEFAULT 'pending',
  ADD CONSTRAINT fk_transactions_party FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_heads ON transactions(from_head_id, from_head_type, to_head_id, to_head_type);