export enum ResourceRecordType {
  A = 1, //Host Address
  NS = 2, //Authoritative Name Server
  MD = 3, //Mail Destination
  MF = 4, // Mail Forwarder
  CNAME = 5, // Canonical Name for Alias
  SOA = 6, //Start of Zone of Authority
  MB = 7, //Mailbox Domain Name
  MG = 8, //Mail Group Member
  MR = 9, //Mail Rename Domain Name
  NULL = 10, //Null
  WKS = 11, //Well Known Service Description
  PTR = 12, //Domain Name Pointer
  HINFO = 13, //Host Info
  MINFO = 14, //Mailbox/Mail-List Info
  MX = 15, // Mail Exchange
  TXT = 16, //Text String
}

export enum ResourceRecordClass {
  IN = 1, //Internet
  CS = 2, //CSNET
  CH = 3, //Chaos
  HS = 4, //Hesiod
}
